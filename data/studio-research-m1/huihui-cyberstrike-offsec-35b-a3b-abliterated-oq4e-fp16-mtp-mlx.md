# Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ4e-FP16-MTP-MLX

## Resumen

CyberStrike OffSec 35B-A3B abliterated en formato oQ4e es una cuantización de precisión mixta, publicada por Studio-Research-M1, del modelo huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated. Este, a su vez, deriva de oyildirim/CyberStrike-OffSec-35B, un ajuste fino orientado a tool calling sobre Qwen/Qwen3.6-35B-A3B, un mixture-of-experts de aproximadamente 36.000 millones de parámetros totales con unos 3.000 millones activos por token. La versión "abliterated" elimina los mecanismos de rechazo del modelo original, de modo que el sistema responde sin filtros de seguridad en dominios de seguridad ofensiva.

El artefacto que nos ocupa no es un modelo nuevo, sino un empaquetado específico para Apple Silicon mediante la librería MLX. Emplea cuantización mixta oQ4e (4 bits con capas seleccionadas en mayor precisión), mantiene la cabeza MTP (multi-token prediction) para decodificación especulativa y conserva la torre de visión en FP32. El resultado ocupa 22,5 GB en disco, lo que permite ejecutarlo en Macs con 32-48 GB de memoria unificada, con un rendimiento medido de 67 tok/s en decodificación y 740-870 tok/s en prefill sobre un M1 Max.

Su relevancia es doble. Por un lado, demuestra que un MoE de 36B puede correr con velocidad usable en hardware de consumo Apple, gracias a la combinación de cuantización agresiva y predicción multi-token. Por otro, su naturaleza abliterated y su orientación a seguridad ofensiva lo sitúan en un terreno delicado: es una herramienta para investigadores de seguridad y equipos de red team, pero también un modelo sin salvaguardas que exige un uso estrictamente controlado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con torre de visión y cabeza MTP; formato MLX |
| Parámetros totales | 35.951.822.704 (~36B) |
| Parámetros activos | ~3B por token (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ4e (4 bits mixto, este repo); oQ8e (8 bits mixto, repo hermano); FP16 para la torre de visión |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer con mezcla de expertos en el que cada token activa aproximadamente 3.000 millones de parámetros de los casi 36.000 millones totales. Sobre esa base, oyildirim/CyberStrike-OffSec-35B aplicó un ajuste fino orientado a tool calling y dominio de seguridad ofensiva; posteriormente, huihui-ai publicó una variante abliterated que suprime las direcciones de rechazo en el espacio de activaciones. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La contribución técnica de esta publicación es el proceso de cuantización oQ: precisión mixta con capas críticas preservadas en mayor resolución. Según el autor, oQ8e alcanza una divergencia KL media de 0,0036 frente a una referencia FP32, inferior a la de los propios pesos BF16 originales (0,0054). El empaquetado mantiene la cabeza MTP, que actúa como decodificador especulativo con una tasa de aceptación del 95-96 % y un incremento de velocidad del 13 % (oQ4e) al 35 % (oQ8e) en generación de código. La torre de visión se conserva en FP32, y el autor verificó que las activaciones máximas rondan 40, muy lejos del límite de FP16 (65.504), sin posiciones no finitas en WikiText-2.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo de pensamiento (thinking) activable.
- Tool calling y function calling: 24/24 en la prueba interna del autor cuando el modo thinking está activo.
- Razonamiento multi-paso y flujos agénticos orientados a tareas de seguridad ofensiva.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias a la torre de visión incluida.
- Decodificación especulativa mediante cabeza MTP (Lightning MTP en oMLX).
- Respuestas sin rechazo en dominios sensibles (variante abliterated).
- Capacidades multilingües limitadas al inglés según la metadata del repositorio.

## Casos de uso

- Red teaming y pruebas de penetración asistidas: el modelo puede razonar sobre vectores de ataque, generar payloads de prueba y encadenar pasos de explotación en entornos autorizados, aprovechando su orientación a seguridad ofensiva y su modo thinking.
- Automatización de análisis de vulnerabilidades: con tool calling activo, puede invocar escáneres y parsear sus resultados dentro de un pipeline agéntico, encadenando llamadas a herramientas sin intervención manual.
- Investigación en alineación y seguridad de IA: la variante abliterated permite estudiar el comportamiento de un modelo sin rechazos, comparándolo con la versión original para medir el efecto de la supresión de direcciones de rechazo.
- Asistente de análisis de capturas de pantalla y diagramas de red: la torre de visión permite pasar imágenes de topologías o interfaces y obtener descripciones y sugerencias técnicas.
- Generación de código de scripting para tareas de automatización ofensiva: el modelo rinde especialmente en código, con 95 tok/s en oQ4e con MTP activo según el autor.
- Despliegue local en estaciones de trabajo Apple: equipos de seguridad que necesitan un modelo sin dependencia de la nube pueden ejecutarlo en un Mac de 32-48 GB con 67 tok/s de decodificación.
- Evaluación comparativa de cuantizaciones: sirve como banco de pruebas para medir el impacto de oQ4e frente a oQ8e en tareas de razonamiento y código sobre hardware Apple Silicon.

## Benchmarks y rendimiento

| Métrica | oQ4e | oQ8e |
|---|---|---|
| Velocidad de decodificación | 67 tok/s | 54 tok/s |
| Velocidad en código con MTP | 95 tok/s | 81 tok/s |
| Prefill | 740-870 tok/s (16k tokens en ~22 s) | no disponible |
| Ganancia MTP en código | +13 % | +35 % |
| Tasa de aceptación MTP | 95-96 % | 95-96 % |
| KLD medio vs FP32 | no disponible | 0,0036 |
| Tool calling (prueba interna, con thinking) | 24/24 | 24/24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son mediciones del autor sobre un Apple M1 Max y pruebas internas, no comparables directamente con suites académicas.

## Requisitos de hardware

- VRAM/memoria unificada: 22,5 GB en disco para oQ4e; el autor recomienda Macs de 32-48 GB. oQ8e requiere unos 40 GB y Macs de 64 GB o más.
- GPU recomendadas: Apple Silicon exclusivamente (M1 Max probado por el autor); no hay soporte CUDA documentado para este empaquetado.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 32 GB o superior; no está pensado para GPUs NVIDIA discretas.
- Opciones de despliegue: MLX y oMLX (con Lightning MTP); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 67 tok/s de decodificación y 740-870 tok/s de prefill en oQ4e sobre M1 Max; un prompt de 16k tokens se procesa en unos 22 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| CyberStrike OffSec 35B-A3B oQ4e (este) | ~36B | ~3B | no disponible | Apache 2.0 | MLX safetensors | Abliterated, tool calling, visión, solo Apple Silicon |
| huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated | ~36B | ~3B | no disponible | Apache 2.0 | safetensors (BF16) | Modelo base sin cuantizar; requiere más memoria |
| oyildirim/CyberStrike-OffSec-35B | ~36B | ~3B | no disponible | no disponible | safetensors | Fine-tune de tool calling previo a la abliteración |
| Qwen/Qwen3.6-35B-A3B | ~36B | ~3B | no disponible | no disponible | safetensors | Modelo original con salvaguardas intactas |

## Limitaciones y advertencias

- Modelo abliterated: no aplica rechazos de seguridad, por lo que puede generar contenido dañino, instrucciones de ataque o material ilegal. Su uso debe limitarse a entornos autorizados y con supervisión.
- Riesgo de alucinación en tool calling: sin modo thinking, el autor documenta que el modelo a veces inventa el resultado de una herramienta en lugar de invocarla. Es obligatorio activar el razonamiento en flujos agénticos.
- Idiomas: solo inglés según la metadata; no se garantiza calidad en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado por una variante sin salvaguardas.
- Plataforma: empaquetado exclusivo para MLX y Apple Silicon; no es portable a CUDA sin reconvertir los pesos.
- Contexto: la longitud de contexto no está documentada en la información disponible; conviene verificarla antes de diseñar pipelines con prompts largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas del autor.
- La cuantización oQ4e introduce pérdida de precisión frente a BF16; para tareas sensibles a la exactitud numérica, el autor recomienda oQ8e.

## Enlaces

- Repositorio HuggingFace (oQ4e): https://huggingface.co/Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ4e-FP16-MTP-MLX
- Repositorio hermano (oQ8e): https://huggingface.co/Studio-Research-M1/Huihui-CyberStrike-OffSec-35B-A3B-abliterated-oQ8e-FP16-MTP-MLX
- Colección del autor: https://huggingface.co/collections/Studio-Research-M1/cyberstrike-35b-a3b-abliterated-oq-mlx-apple-silicon-6ae714be7b5be2d9910f30bc
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated
- Fine-tune de tool calling: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
