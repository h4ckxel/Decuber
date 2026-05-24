<div align="center">

<img src="assets/badge.png" alt="Decuber banner" width="100%">

# DECUBER

Rubik cube color codec for hiding short messages in 3x3 color faces.

[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-1167d8?style=for-the-badge)](https://h4ckxel.github.io/Decuber)
[![Python](https://img.shields.io/badge/python-3.x-ffe100?style=for-the-badge&logo=python)](https://www.python.org/)
[![Tests](https://img.shields.io/badge/tests-unittest-00b86b?style=for-the-badge)](#testing)
[![License](https://img.shields.io/badge/license-MIT-ff2bd6?style=for-the-badge)](LICENSE)

</div>

---

## Descripcion Corta

Decuber convierte texto en secuencias de colores inspiradas en un cubo Rubik. Cada bloque se muestra como una cara 3x3 con centro blanco, lista para copiarse como codigo de colores o recrearse visualmente.

Tambien incluye `DecuberBase36.py`, un CLI sin dependencias externas para codificar y decodificar bytes, streams y archivos usando simbolos compatibles con el alfabeto visual de Decuber.

> Decuber no es cifrado seguro. Sirve para puzzles, estetica visual, retos de cubing y mensajes ocultos casuales. No lo uses para proteger secretos reales sin una capa criptografica externa.

## Demo

Demo publica: [h4ckxel.github.io/Decuber](https://h4ckxel.github.io/Decuber)

![Decuber screenshot](assets/screenshot.png)

## Que Hace Decuber

- Codifica mensajes cortos en caras de cubo Rubik 3x3.
- Decodifica secuencias de iniciales de color en vivo.
- Muestra el resultado visualmente como matrices de cubos.
- Mantiene una version CLI para texto, bytes, stdin/stdout y archivos.
- Funciona en GitHub Pages con HTML, CSS y JavaScript vanilla.

## Como Funciona El Algoritmo De Colores

La version web usa este alfabeto:

```text
 abcdefghijklmnopqrstuvwxyz.!?@#:/()
```

Hay 6 colores base:

```text
white red blue green orange yellow
```

Con `6 x 6 = 36` pares posibles, Decuber asigna cada caracter soportado a un par de colores. Una cara 3x3 guarda 4 caracteres:

- Los 8 stickers externos contienen 8 colores.
- Cada 2 colores representan 1 caracter.
- El centro siempre es blanco.
- El orden de lectura es izquierda a derecha, de arriba hacia abajo, saltando el centro.

Ejemplo conceptual:

```text
mensaje -> pares de colores -> cara 3x3 -> codigo de iniciales
```

## Uso Web

1. Abre la demo o `index.html` localmente.
2. Escribe un mensaje en `ENCODE.EXE`.
3. Copia la secuencia generada, por ejemplo `rbwywbwbw`.
4. Pega la secuencia en `DECODE.EXE` para recuperar el texto.

Caracteres soportados por la web:

```text
a-z, espacio, . ! ? @ # : / ( )
```

## Uso CLI Con DecuberBase36.py

El script real se llama:

```bash
DecuberBase36.py
```

Codificar texto directo:

```bash
python DecuberBase36.py "hello world"
```

Salida real:

```text
v:c)c:dddddga/dodgdjddc#
```

Decodificar esa salida:

```bash
python DecuberBase36.py -d "v:c)c:dddddga/dodgdjddc#"
```

Codificar un archivo:

```bash
python DecuberBase36.py -i demo.zip -o encoded.txt
```

Recuperar el archivo:

```bash
python DecuberBase36.py -d -i encoded.txt -o recovered.zip
```

Usar stdin/stdout:

```bash
cat demo.bin | python DecuberBase36.py > encoded.txt
python DecuberBase36.py -d -i encoded.txt -o recovered.bin
```

Ver resumen de tamano:

```bash
python DecuberBase36.py -s "hello"
```

Salida:

```text
File Summary:
- File size: 5 Bytes (40 bits)
- Encoded length: 12 characters
- Needed cubes: 3 (1 face per cube, 4 characters each)
```

### Nota Sobre El Formato CLI

Las salidas nuevas del CLI empiezan con `v:`. Ese prefijo permite round-trip correcto de:

- entrada vacia,
- bytes nulos,
- archivos binarios,
- stdin/stdout,
- texto normal.

El decodificador tambien acepta cadenas antiguas sin prefijo cuando sean validas para el formato numerico previo.

## Instalacion Y Ejecucion Local

Clona el repositorio:

```bash
git clone https://github.com/h4ckxel/Decuber.git
cd Decuber
```

Abrir la web:

```bash
# Opcion simple: abre index.html en tu navegador
```

Ejecutar CLI:

```bash
python DecuberBase36.py "hello world"
```

No hay dependencias externas para el CLI. La web usa HTML, CSS y JavaScript vanilla.

## Testing

Ejecuta la suite automatizada:

```bash
python -m unittest discover -s tests
```

La suite cubre:

- round-trip de bytes, texto y binarios,
- bytes nulos,
- entrada vacia,
- archivos pequenos,
- stdin/stdout,
- caracteres invalidos al decodificar,
- calculo de cubos necesarios en modo summary.

## Roadmap

- Exportar imagenes de las caras generadas.
- Mejorar impresion de plantillas para cubos fisicos.
- Agregar mas presets visuales sin romper GitHub Pages.
- Documentar mejor compatibilidad entre web visual y CLI binario.

## Licencia

MIT License. Ver [LICENSE](LICENSE).

Proyecto original: StegaCube by Christian Lepuschitz. Modificaciones: h4ckxel.
