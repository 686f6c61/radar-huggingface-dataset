# trmz/airwrite-xr

## Resumen

AirWrite XR es un sistema de reconocimiento de escritura en el aire desarrollado por el usuario trmz, pensado para gafas de realidad mixta como Meta Quest 3. Convierte la trayectoria 3D del dedo índice captada por el seguimiento de manos del casco en texto en minúsculas del inglés (letras a-z y espacio), sin necesidad de lápiz, mando, teclado ni gesto de "pluma abajo". El modelo trabaja en streaming: actualiza un borrador unas 8 veces por segundo mientras se escribe y fija cada palabra 200 ms después de pasar a la siguiente.

Técnicamente no es un único modelo, sino un ensemble de seis codificadores de movimiento (tres Conformer de 2 bloques con posiciones rotatorias y tres BiLSTM) que suman unos 2,85 millones de parámetros y emiten una distribución CTC de 28 símbolos a 15 Hz. Las salidas se combinan mediante búsqueda de prefijos CTC con un modelo de lenguaje de caracteres (5-grama y léxico), y se reordenan con SmolLM2-135M y SmolLM2-1.7B. Es un prototipo de investigación publicado con licencia Apache 2.0, entrenado con datos sintéticos y con solo 170 grabaciones reales del propio autor.

Su relevancia radica en que aborda un problema que los OCR convencionales no resuelven: la escritura aérea acumulativa, sin levantamiento de pluma y con palabras superpuestas, resulta ilegible como imagen. AirWrite demuestra que modelar la trayectoria temporal 3D, y no la imagen, permite leer frases completas con un CER del 7,5 % en su conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 3 Conformer (2 bloques, posiciones rotatorias, uno con CTC autoconducido) y 3 BiLSTM, con decodificacion CTC y reranking mediante SmolLM2 |
| Parametros totales | Aproximadamente 2,85 M en los seis codificadores de movimiento (548k + 548k + 552k + 400k + 400k + 400k) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa secuencias de movimiento a 60 Hz con stride 4, salida a 15 Hz; no se especifica limite de longitud) |
| Tipos de cuantizacion | No disponible (se mencionan versiones ONNX para navegador en el repositorio de GitHub, sin detallar cuantizacion) |
| Idiomas soportados | Ingles (solo letras a-z y espacio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cada miembro con su .json de configuracion y normalizacion); versiones ONNX para navegador en el repositorio |

## Arquitectura y entrenamiento

El sistema combina seis codificadores de secuencia independientes que procesan la trayectoria 3D del dedo índice en el marco de referencia de la cabeza, remuestreada a 60 Hz. Tres son Conformer de dos bloques con posiciones rotatorias (uno de ellos con CTC autoconducido, que realimenta las posteriores intermedias de letras al codificador) y tres son BiLSTM. Las salidas se agrupan a nivel de frase y se decodifican con búsqueda de prefijos CTC (anchura 64) apoyada en un 5-grama de caracteres y un trie léxico; después se puntúan candidatos con un pequeño Transformer de caracteres y SmolLM2-135M, se amplía el léxico en dos rondas y SmolLM2-1.7B reordena las ocho mejores frases.

El entrenamiento se divide en dos fases. La preentrenamiento es sintética: trazos de un port en PyTorch del RNN de síntesis de escritura de Graves, elevados a trayectorias 3D ordenadas en el tiempo y calibrados con poses reales de manos de Quest, añadiendo ruido, inclinación, deriva de línea base, desplazamientos sin escritura y variación de tempo. El ajuste fino usa 170 grabaciones reales de seguimiento de manos del autor (unos 40 minutos de escritura), sin solapamiento de frases con los datos sintéticos. El modelo se evaluó con validación cruzada en 4 particiones congeladas de 9 grabaciones cada una (36 en total), sin usar datos de evaluación para seleccionar checkpoints.

## Capacidades

- Reconocimiento de escritura aérea en 3D a partir de la trayectoria del dedo índice, sin imágenes de cámara, vídeo ni audio.
- Salida de texto en minúsculas del inglés limitada a los caracteres a-z y espacio.
- Funcionamiento en streaming: borrador actualizado unas 8 veces por segundo y bloqueo de palabra 200 ms después de avanzar.
- Lectura de escritura en mayúsculas (CAPS) en una prueba con 6 grabaciones bloqueadas, aunque el conjunto de símbolos de salida es en minúsculas.
- Inferencia en navegador mediante versiones ONNX de los seis modelos, integrable en aplicaciones WebXR.
- Segmentación implícita de palabras y espacios sin gesto de levantamiento de pluma.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni razonamiento multietapa más allá del reranking lingüístico.

## Casos de uso

- Entrada de texto en realidad mixta y aumentada: escribir en el aire con el dedo índice en Meta Quest 3 para introducir texto en formularios, buscadores o chats sin teclado físico ni mando, aprovechando la actualización en streaming cada 125 ms.
- Accesibilidad para usuarios con movilidad reducida: personas que no pueden usar teclado o controladores pueden comunicarse mediante gestos de escritura aérea captados por el seguimiento de manos del casco.
- Anotación rápida en entornos industriales o de campo: técnicos con las manos ocupadas o con guantes que necesitan registrar notas breves mediante gestos en el aire, sin pantallas táctiles.
- Investigación en interacción persona-ordenador: base reproducible para estudiar reconocimiento de gestos 3D, decodificación CTC y combinación de modelos de movimiento con modelos de lenguaje pequeños.
- Prototipos de interfaces WebXR: integración en aplicaciones de navegador para cascos mediante los modelos ONNX publicados, sin depender de backend en la nube.
- Docencia y demostraciones de reconocimiento de escritura: ejemplo práctico de pipeline completo (captura de movimiento, ensemble de codificadores, CTC con léxico y reranking con LLM) para cursos de aprendizaje automático.
- Rehabilitación y seguimiento motor: registro de trazados aéreos para analizar temblor, fluidez o velocidad de escritura en sesiones de fisioterapia, dado que el modelo consume trayectorias temporales y no imágenes.

## Benchmarks y rendimiento

| Version | Miembros de movimiento | CER asistido | WER | Frases exactas |
|---|---|---|---|---|
| v9 | 3 Conformer | 10,7 % | No disponible | No disponible |
| v13 (esta release) | 3 Conformer + 3 BiLSTM | 7,5 % | 16,4 % | 19 / 36 |

El CER por partición de la versión v13 es de 5,4 / 6,0 / 4,8 / 13,9 %. Las puntuaciones usan los prioris de inglés general. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para los seis codificadores (2,85 M de parámetros); el consumo dominante proviene de los modelos SmolLM2-135M y SmolLM2-1.7B usados en el decodificador, que requieren aproximadamente 0,3 GB y 3,5 GB en FP16 respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna sirve para los codificadores; para el reranking con SmolLM2-1.7B se recomienda al menos una RTX 3060 de 12 GB o superior (RTX 4090, A100, H100) si se ejecuta en FP16 sin cuantizar.
- Cabe en GPU consumer: sí, en tarjetas con 6-8 GB de VRAM o más, e incluso en CPU para los codificadores de movimiento.
- Opciones de despliegue: PyTorch para los pesos safetensors, ONNX Runtime en navegador para WebXR, y llama.cpp u Ollama para los modelos SmolLM2 del decodificador si se quiere reducir VRAM.
- Latencia y throughput: no se han publicado cifras de latencia ni throughput en la informacion disponible; la model card indica una actualización del borrador aproximadamente 8 veces por segundo y un bloqueo de palabra a los 200 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirWrite XR (v13) | 2,85 M (ensemble) + SmolLM2 | No disponible | Escritura aérea 3D a texto | Apache 2.0 | Hugging Face, GitHub, demo WebXR |
| TrOCR-large | No disponible en la informacion | No disponible | OCR de imagen a texto | No disponible | Usado como referencia en la model card; falla en escritura aérea acumulativa |
| Qwen3-VL-4B | 4 000 M (aproximado) | No disponible | Vision-lenguaje | No disponible | Usado como referencia en la model card; falla en escritura aérea acumulativa |
| SmolLM2-1.7B | 1 700 M | No disponible | Modelo de lenguaje | Apache 2.0 | Hugging Face; usado como reranker dentro de AirWrite |

La comparativa directa con sistemas de reconocimiento de escritura aérea especializados no está disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con un único conjunto pequeño de escritura cursiva del propio autor (170 grabaciones, unos 40 minutos), por lo que la generalización a otros estilos de letra es limitada.
- Solo admite los caracteres a-z y espacio; no reconoce dígitos, signos de puntuación, acentos ni otros alfabetos.
- Idioma limitado al inglés; no hay soporte multilingüe.
- Es un prototipo de investigación (etiquetado como Prototype), no un producto listo para producción.
- La escritura aérea acumulativa sin levantamiento de pluma puede degradar la precisión en frases largas; el CER por partición varía entre 4,8 % y 13,9 %.
- Riesgo de alucinación lingüística en el decodificador: el reranking con SmolLM2 puede favorecer frases plausibles en inglés aunque no coincidan con el trazo real.
- Depende de la calidad del seguimiento de manos del casco (Quest 3) y de la calibración de las poses; cambios de dispositivo pueden afectar al rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte; el autor no documenta sesgos demográficos ni de estilo más allá del conjunto de entrenamiento.
- No se han publicado cifras de latencia, throughput ni consumo energético en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trmz/airwrite-xr
- Paper: https://tr-mz.github.io/papers/airwrite-xr/
- Demo en vivo (Quest Browser): https://tr-mz.github.io/airwrite-xr/
- Código en GitHub: https://github.com/TR-MZ/airwrite-xr
- Repositorio de síntesis de escritura usado para datos sintéticos: https://github.com/sjvasquez/handwriting-synthesis
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2104.02724
- Proyecto VibeAR.dev: https://vibear.dev
