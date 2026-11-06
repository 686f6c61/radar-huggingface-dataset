# Vishwasaidev/lipi

## Resumen

Lipi es un generador de caligrafía devanagari que produce texto en hindi, maratí y sánscrito en ocho estilos visuales distintos sin utilizar ningún tipo de aprendizaje automático. Desarrollado por Vishwasaidev, el proyecto se apoya en trazos dibujados a mano y en las curvas de fuentes OpenType de código abierto, combinados mediante reglas fijas de conformación (shaping) y rasterización por scanline. No es un modelo neuronal: no hay pesos entrenados en el sentido habitual, sino tensores que codifican centros de trazo y geometría de glifos exportados a `weights.safetensors`.

El modelo resuelve un problema muy concreto: generar imágenes de texto devanagari caligráfico con calidad tipográfica y control fino sobre el estilo, el tamaño, la tinta y los adornos, algo que los modelos de difusión text-to-image habituales no logran con precisión para escrituras no latinas. Su enfoque determinista y auditable lo hace especialmente interesante para investigación en interpretabilidad, para docentes y para diseñadores que necesitan renderizar devanagari sin depender de un modelo generativo opaco.

La relevancia actual radica en su carácter de "modelo sin entrenamiento": demuestra que se puede publicar un artefacto en Hugging Face con la etiqueta `text-to-image` y pesos en formato `safetensors` sin haber pasado por un pipeline de entrenamiento, lo que plantea preguntas interesantes sobre la taxonomía de modelos y sobre cómo se documentan los artefactos procedurales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Procedural determinista: trazos vectoriales dibujados a mano + curvas de fuentes OpenType, conformación por reglas fijas (o HarfBuzz) y rasterización por scanline |
| Parámetros totales | no disponible (no es un modelo neuronal; los "pesos" son tensores de centros de trazo y geometría) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no procesa texto como secuencia; acepta una cadena de texto de entrada) |
| Tipos de cuantización | no aplica (tensores en `safetensors`; sin cuantización) |
| Idiomas soportados | Hindi, maratí y sánscrito (escritura devanagari); latín, dígitos y puntuación mediante letras Hershey futural |
| Licencia | CC BY 4.0 (trazos dibujados a mano y tensores `glyphs.deva.*`); fuentes bajo SIL OFL 1.1; Hershey futural en dominio público |
| Formato de pesos | `weights.safetensors` (exportado con `export_weights.py`) |

## Arquitectura y entrenamiento

Lipi no entrena nada. Su pipeline consta de cuatro capas: (1) letras, donde los estilos de pluma (`lekhani`, `tulika`) usan centros de trazo dibujados a mano y los estilos de tipo (`kalam`, `tiro`, `rozha`, `amita`, `tillana`, `jaini`) usan contornos de fuentes OpenType leídos con `fontTools`; (2) conformación, con reglas fijas en `devanagari.py` para las plumas (media forma, apilamiento, reph, rakar, signos vocálicos colgantes) o HarfBuzz para los estilos de tipo; (3) suavizado y pluma, con recorte de esquinas de Chaikin y barrido de una pluma ancha o pincel como formas convexas; y (4) rasterización, con "neuronas de semiplano" `d - nx*x - ny*y` por píxel para las plumas y relleno scanline con 4×4 muestras por píxel para los tipos.

Los datos de entrenamiento son inexistentes. El corpus de trazos (`data/devanagari/strokes.txt`) fue dibujado punto a punto por el autor en orden de escritura: 34 consonantes (incluida ळ), las vocales अ इ उ ऊ ऋ ए y sus derivadas आ ई ओ औ ऐ ऑ ॲ, los signos vocálicos, ं ँ ः ् ़, ॐ ऽ । ॥, los dígitos ०-९ y las formas क्ष त्र ज्ञ श्र. No existe un conjunto de datos abierto de trazos devanagari con licencia clara, según el autor, y una fuente del sistema sirvió solo como guía visual. Las fuentes utilizadas (Kalam, Tiro Devanagari Marathi, Rozha One, Amita, Tillana, Jaini) están sin modificar y no forman parte de `weights.safetensors`.

La innovación técnica destacable es la representación de trazos como tensores exportables a `safetensors` y la implementación de rasterización mediante operaciones de semiplano que recuerdan a la aritmética de redes neuronales, lo que justifica la etiqueta `interpretability`. El proyecto es hermano de Quill, el modelo de caligrafía latina y kanji, mantenido por separado para preservar licencias independientes.

## Capacidades

- Generación de imágenes de texto devanagari en ocho estilos: dos de pluma (`lekhani` con pluma de caña ancha, `tulika` con pincel) y seis de tipo (`kalam`, `tiro`, `rozha`, `amita`, `tillana`, `jaini`).
- Control de tamaño del cuerpo de texto en píxeles (`--size`) desde la línea de cabecera hasta la línea base.
- Selección de tinta entre nueve opciones: `iron`, `black`, `sepia`, `sumi`, `red`, `blue`, `green`, `gold`, `vermilion`.
- Letra inicial decorativa (`--initial`): dibuja la primera sílaba al doble de tamaño en rojo, colgando de la línea de cabecera.
- Sello (`--seal`): graba ॐ, श्री o hasta cuatro letras latinas en un sello rojo.
- Animación (`--animate`): genera un WebP animado que empieza en papel en blanco; las plumas escriben trazo a trazo y dibujan la cabecera de cada palabra al final, mientras los tipos entintan sílaba a sílaba de izquierda a derecha.
- Adorno (`--flourish`): añade una swash afilada bajo el texto.
- Conformación correcta de devanagari: media forma, apilamiento, reph, rakar, signos vocálicos, ँ que se convierte en ं cuando ya hay un signo vocálico encima, virama visible en grupos de tres consonantes.
- Soporte de letras latinas, dígitos y puntuación mediante Hershey futural.
- Interfaz web (Heroku), demo en navegador vía Pyodide con harfbuzzjs como WebAssembly, y CLI (`lipi.py`).
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.

## Casos de uso

- **Diseño editorial y portadas**: generar títulos en devanagari con estilos como `rozha` (póster de alto contraste) o `tiro` (letra de libro con formas maratíes) para maquetación de publicaciones en hindi, maratí o sánscrito, con control exacto del tamaño y la tinta.
- **Material educativo de sánscrito**: producir láminas con ॐ, श्री o versos como "सत्यमेव जयते" en estilo `lekhani` con inicial decorativa, útiles para enseñanza de la escritura devanagari sin depender de fuentes del sistema.
- **Investigación en interpretabilidad**: estudiar la representación de trazos como tensores en `safetensors` y la rasterización por semiplanos como análogo geométrico de operaciones neuronales, sin necesidad de entrenar ni ejecutar un modelo grande.
- **Generación de sellos y marcas**: crear sellos rojos con ॐ, श्री o iniciales latinas para membretes, certificados o arte digital, integrables en un pipeline Python con `numpy` y `pillow`.
- **Animación de escritura para vídeo o redes**: usar `--animate` para producir WebP animados que muestran la escritura trazo a trazo, útiles en contenido divulgativo sobre escritura devanagari o en cabeceras animadas.
- **Pruebas de conformación devanagari**: comparar las reglas fijas de `devanagari.py` con la conformación de HarfBuzz en los estilos de tipo para validar implementaciones de shaping o detectar casos límite (grupos de tres consonantes, reph, rakar).
- **Prototipado tipográfico**: evaluar visualmente cómo se comportan las formas maratíes (अ ल श झ) de Tiro Devanagari Marathi frente a las formas hindi estándar en un mismo texto, antes de elegir una fuente para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no ser un modelo neuronal entrenado, no aplican métricas como MMLU, HumanEval o GSM8K. El autor no reporta tiempos de inferencia, throughput ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo no usa GPU. Se ejecuta en CPU con `numpy`.
- **GPU recomendadas**: ninguna; no requiere aceleración por hardware.
- **Consumer GPU**: no aplica; funciona en cualquier equipo con CPU moderna.
- **Dependencias**: `numpy`, `pillow`, `fonttools`, `uharfbuzz` (Python). En el Space de Pyodide, `uharfbuzz` se sustituye por `harfbuzzjs` vía WebAssembly.
- **Opciones de despliegue**: servidor local (`python server.py` en `http://127.0.0.1:8793`), CLI (`python lipi.py`), Space de Hugging Face con Pyodide, aplicación web en Heroku.
- **Latencia y throughput**: no disponibles en la información proporcionada; al ser rasterización por scanline y operaciones de semiplano, el coste depende del tamaño de imagen y del número de glifos, pero no se aportan cifras.
- **Almacenamiento**: el repositorio ocupa 0.0 GB según Hugging Face; los pesos y las fuentes son ligeros.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas/escrituras | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lipi (Vishwasaidev) | Procedural determinista | Devanagari (hindi, maratí, sánscrito) + latín Hershey | Ninguno | CC BY 4.0 + SIL OFL 1.1 | Hugging Face, Space, Heroku |
| Quill (Vishwasaidev) | Procedural determinista | Latín y kanji | Ninguno | Propia (no detallada aquí) | Hugging Face |
| Modelos de difusión text-to-image (p. ej. Stable Diffusion) | Neuronal generativo | Multilingüe, pero con rendimiento pobre en devanagari | Millones de pares imagen-texto | Varía | Amplia |
| Fuentes OpenType devanagari (Kalam, Tiro, etc.) | Tipografía estática | Devanagari | Diseño humano | SIL OFL 1.1 | Amplia |

La comparación directa con modelos neuronales no es significativa: Lipi no compite en generación libre de imágenes, sino en renderizado tipográfico controlado de devanagari. Frente a las fuentes OpenType, Lipi añade animación, sellos, iniciales decorativas y estilos de pluma dibujados a mano que no existen como fuentes.

## Limitaciones y advertencias

- **No es un modelo generativo general**: solo produce texto devanagari y latino Hershey; no genera imágenes libres, no responde a prompts y no procesa lenguaje natural.
- **Cobertura limitada de glifos**: 34 consonantes, un subconjunto de vocales y signos; grupos de tres consonantes conservan virama visible en lugar de apilarse, y no se documentan todas las combinaciones posibles.
- **Dependencia de fuentes externas**: los estilos de tipo requieren las fuentes en `fonts/` bajo SIL OFL 1.1; su modificación o redistribución debe respetar esa licencia y conservar los avisos de copyright.
- **Licencia CC BY 4.0**: permite uso comercial con atribución; hay que citar al autor de los trazos y de los tensores `glyphs.deva.*`. Las fuentes tienen su propia licencia OFL y los avisos deben mantenerse.
- **Sin benchmarks ni validación formal**: no hay métricas de calidad tipográfica, cobertura de shaping ni pruebas automatizadas publicadas.
- **Riesgo de errores de conformación**: las reglas fijas de `devanagari.py` pueden no cubrir todos los casos del devanagari complejo; el autor recomienda comparar con HarfBuzz en los estilos de tipo.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-04, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la vigencia del proyecto.
- **Cero descargas y cero likes**: no hay evidencia de uso en producción ni de validación por la comunidad.
- **Sin soporte de tool calling ni agentes**: no es adecuado para pipelines de razonamiento o automatización conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishwasaidev/lipi
- Space (Pyodide): https://huggingface.co/spaces/Vishwasaidev/lipi
- Aplicación web: https://lipi-devanagari-f797919c0a6d.herokuapp.com/
- Modelo hermano Quill: https://huggingface.co/Vishwasaidev/quill
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia SIL OFL 1.1: https://openfontlicense.org
- Hershey futural (dominio público, A. V. Hershey, US National Bureau of Standards, 1967): referencia histórica, sin URL directa en la información disponible.
