# zen21/books-in-matrix

## Resumen

`zen21/books-in-matrix` es un repositorio de modelos neuronales minúsculos entrenados desde cero, cada uno sobre un único libro. No es un modelo de lenguaje de propósito general ni un asistente conversacional: es un experimento de memorización y compresión extrema en el que una red neuronal sustituye al texto original. El repositorio no contiene ningún texto, solo pesos (enteros de 1 byte con una escala por fila) y, para los libros "compact", un flujo codificado aritméticamente. Los decodificadores reconstruyen cada libro byte a byte y verifican el resultado contra su SHA-256.

Cada modelo es un transformer byte-level de estilo Qwen3 (RoPE, RMSNorm, QK-norm, SwiGLU) con embeddings propios, entrenado exclusivamente con su libro y reentrenado para que los pesos sobrevivan al redondeo a 8 bits. Los libros se dividen en fragmentos de 252 bytes, y cada fragmento se indexa con una clave de 4 tokens (un marcador más el índice en tres bytes), de modo que las claves no se almacenan. La innovación principal es el decodificador en JavaScript que construye `exp`, `log`, `sin`, `cos` y raíces cuadradas a partir de aritmética IEEE 754 en un orden fijo, garantizando probabilidades idénticas bit a bit en cualquier navegador o máquina.

El proyecto se publica bajo licencia CC0-1.0 y solo incluye libros de dominio público o publicados con permiso. Es relevante como demostración de los límites de la compresión neuronal y de la memorización exacta, no como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer byte-level de estilo Qwen3 (RoPE, RMSNorm, QK-norm, SwiGLU) |
| Parametros totales | no disponible (variable por libro; descrito como "tiny models") |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 252 bytes por fragmento (chunks de 252 bytes) |
| Tipos de cuantizacion | Pesos en enteros de 1 byte con una escala por fila (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (más flujo `stream.bin` codificado aritméticamente en libros compact) |

## Arquitectura y entrenamiento

Cada modelo es un transformer byte-level pequeño con embeddings propios, atención con RoPE, normalización RMSNorm, QK-norm y capas SwiGLU, siguiendo el diseño de Qwen3. El entrenamiento se realiza desde cero sobre un único libro por modelo, sin datos adicionales. Tras el entrenamiento, los pesos se reentrenan o ajustan para que sobrevivan al redondeo a 8 bits (enteros de 1 byte con una escala por fila), lo que permite almacenar el modelo en un espacio mínimo.

El mecanismo de reconstrucción divide el libro en fragmentos de 252 bytes. Cada fragmento *i* recibe una clave de 4 tokens: un marcador seguido del índice *i* codificado en tres bytes, de forma que las claves son números de fragmento y no necesitan almacenarse. En los libros "exact", el modelo por sí solo reproduce el libro byte a byte a partir de esas claves. En los libros "compact", el modelo predice cada byte y un pequeño flujo (`stream.bin`) codificado aritméticamente selecciona el byte correcto, lo que resulta siempre exacto y varias veces más pequeño que el texto original. El decodificador JavaScript implementa `exp`, `log`, `sin`, `cos` y raíces cuadradas mediante aritmética IEEE 754 en un orden fijo para asegurar probabilidades idénticas bit a bit en todas las plataformas. El catálogo de libros, tamaños y checksums está en `catalog.json`, y la configuración de cada libro en `books/<book>/config.json`.

## Capacidades

- Reconstrucción exacta byte a byte de un libro concreto a partir de claves de fragmento, verificada contra SHA-256.
- Memorización exacta en modelos "exact": el modelo solo escribe el libro de vuelta.
- Compresión con modelo predictivo más flujo aritmético en modelos "compact", con tamaño varias veces menor que el texto.
- Predicción byte a byte (modelo byte-level, sin tokenizador de subpalabras).
- Decodificación determinista y portable: mismos resultados en Node.js, Python y navegador.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües de propósito general.
- No es un modelo generativo abierto: solo reproduce el libro sobre el que fue entrenado.

## Casos de uso

- Archivo y preservación digital: almacenar libros de dominio público como pesos neuronales y reconstruirlos exactamente, verificando la integridad con SHA-256 en cada decodificación.
- Compresión de corpus textuales: usar los modelos "compact" para reducir el tamaño de libros respecto al texto original, con reconstrucción exacta garantizada.
- Investigación en memorización: estudiar cómo una red pequeña memoriza secuencias byte a byte y qué capacidad requiere para ello.
- Reproducibilidad y portabilidad: desplegar el decodificador en navegador o Node.js sin dependencias para verificar que las probabilidades son idénticas en distintas plataformas.
- Docencia sobre cuantización: ilustrar el reentrenamiento de pesos para sobrevivir al redondeo a 8 bits y el uso de escalas por fila.
- Pruebas de decodificación aritmética: validar implementaciones de codificación aritmética y de funciones matemáticas deterministas en JavaScript.
- Benchmark de decodificadores: comparar el rendimiento de `decode.js` (Node.js, todos los núcleos) frente a `decode.py` (PyTorch + safetensors).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos se describen como "tiny" y el repositorio ocupa 0.0 GB, por lo que se espera que quepan en CPU.
- GPU recomendadas: no disponible; el decodificador principal (`decode.js`) funciona en CPU con Node.js 18+.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño mínimo, aunque no se especifican requisitos.
- Opciones de despliegue: Node.js 18+ (`node decode.js`), Python con `torch` y `safetensors` (`python decode.py`), o abrir `books/<book>/demo.html` en un navegador.
- Latencia y throughput: no disponibles; el decodificador usa todos los núcleos de CPU en Node.js.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoría (memorización de un único libro en redes minúsculas con reconstrucción exacta).

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: no responde preguntas, no genera texto libre ni mantiene conversaciones.
- Solo reproduce el libro concreto sobre el que fue entrenado; no generaliza a otros textos.
- El contexto está limitado a fragmentos de 252 bytes.
- Idiomas soportados no disponibles; la cobertura depende de los libros incluidos.
- Riesgo de alucinación: no aplica en el sentido habitual, pero cualquier fallo en la reconstrucción se detecta solo mediante la verificación SHA-256.
- La licencia CC0-1.0 es permisiva, pero los libros incluidos deben ser de dominio público o publicados con permiso; el uso comercial de los pesos está permitido por la licencia del repositorio, aunque conviene verificar los derechos de cada obra.
- Los libros "compact" dependen de un flujo aritmético adicional (`stream.bin`) y del decodificador JavaScript determinista; alterar el orden de las operaciones IEEE 754 puede romper la reconstrucción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline definido.

## Enlaces

- Hugging Face: https://huggingface.co/zen21/books-in-matrix
