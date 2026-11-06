# sourojitdotcom/AksharaLP-Kosh-1.2M

## Resumen

AksharaLP-Kosh-1.2M es un sistema de transliteración de hindi romanizado (escrito con caracteres latinos) a devanagari, diseñado para ejecutarse íntegramente en el dispositivo del usuario, incluido un navegador web. Lo desarrolla el autor independiente sourojitdotcom y se publica bajo licencia CC BY-SA 4.0. Su propuesta central es el tamaño: 777.970 bytes comprimidos (0,78 MB) que contienen el modelo, un léxico de 180.000 palabras, un estudiante de canal inverso, un reranker y un runtime JavaScript sin dependencias. No requiere servidor, GPU ni red tras la carga inicial.

El modelo resuelve un problema concreto y frecuente en contextos indios: los usuarios escriben hindi con letras latinas en teclados QWERTY ("kal meeting hai, kaise ho?") y necesitan convertirlo a devanagari (कल मीटिंग है, कैसे हो?). Conviene subrayar que translitera (cambia de escritura), no traduce. La arquitectura es un transformer de 988.928 parámetros con cuantización consciente de 3 bits y codificación aritmética (XQC1), más un léxico comprimido con un codificador propio (WLC1).

Su relevancia actual reside en la eficiencia extrema: alcanza un 68,09% de top-1 en el test de hindi de Aksharantar con menos de 1 MB, frente a los aproximadamente 404 MB del paquete completo de IndicXlit (69,33%). Es un caso de estudio sobre cuánto rendimiento se puede extraer de un presupuesto de bytes muy ajustado mediante cuantización agresiva y compresión entrópica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (988.928 parametros en el modelo frontal) con cuantizacion consciente de 3 bits y codificacion aritmetica (XQC1); lexico de 180.000 palabras comprimido con WLC1; estudiante de canal inverso y reranker |
| Parametros totales | 1.205.249 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesamiento a nivel de palabra) |
| Tipos de cuantizacion | 3 bits por parametro (3,06 bits/parametro efectivos) mediante quantisation-aware training |
| Idiomas soportados | Hindi (hi) y romanizacion latina del hindi; etiquetado tambien como en |
| Licencia | CC BY-SA 4.0 (share-alike; no ofrecido para uso comercial) |
| Formato de pesos | Datos propietarios comprimidos (XQC1 para pesos, WLC1 para lexico) mas runtime JavaScript; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema combina varios componentes empaquetados en una sola descarga: un transformer frontal de 988.928 parámetros, un léxico de 180.000 palabras (285 KB, aproximadamente 1,6 bytes por palabra), un estudiante de canal inverso, un reranker y el runtime JavaScript. Los pesos del transformer se comprimen a 3,06 bits por parámetro mediante cuantización consciente de 3 bits más un codificador aritmético (XQC1). El entrenamiento se apoya en los conjuntos de datos ai4bharat/Aksharantar y ai4bharat/IndicCorpV2. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es la compresión extrema del conjunto: el modelo frontal ocupa 375 KB de pesos dentro de la descarga total de 777.970 bytes gzip. El autor reconoce explícitamente que buena parte de la precisión procede de la cobertura del léxico: al eliminar las 9.991 palabras de referencia del test de la lista del léxico, el mismo modelo cae al 32,70% de top-1, lo que revela que las palabras fuera de lista (nombres nuevos, jerga, grafías raras) son su punto débil.

## Capacidades

- Transliteración palabra a palabra de hindi romanizado a devanagari, con salida de candidatos ordenados (top-1, top-3, top-8).
- Ejecución 100% en el dispositivo: CPU, navegador (Web Worker) y entornos offline, sin llamadas de red tras la carga.
- Runtime JavaScript sin dependencias, lo que facilita la integración en aplicaciones web y extensiones.
- Léxico integrado de 180.000 palabras que actúa como mecanismo de recuperación y reranking.
- Estudiante de canal inverso para puntuar y ordenar hipótesis de transliteración.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a hindi y su romanización; no cubre otras lenguas indias.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Teclados y editores en navegador: el runtime JavaScript se incrusta en un Web Worker y convierte cada palabra mientras el usuario escribe, sin enviar pulsaciones a ningún servidor; adecuado por su tamaño de 0,78 MB y su funcionamiento offline.
- Aplicaciones de mensajería con soporte de hindi: permite que un usuario escriba en letras latinas y el destinatario reciba devanagari, con la privacidad que aporta el procesamiento local.
- Formularios y bases de datos con entrada romanizada: normalización de nombres y direcciones escritos en caracteres latinos hacia devanagari antes de almacenarlos, usando la lista de candidatos top-3 o top-8 para desambiguación asistida.
- Herramientas educativas de aprendizaje del devanagari: el modelo puede mostrar varias transliteraciones candidatas para una misma palabra latina, lo que ayuda al estudiante a entender la ambigüedad de la romanización.
- Extensiones de navegador y aplicaciones de escritorio offline: al no requerir red ni GPU, encaja en entornos con conectividad intermitente o con requisitos estrictos de privacidad.
- Prototipado e investigación sobre compresión de modelos: sirve como referencia reproducible para estudiar cuantización de 3 bits, codificación aritmética y equilibrio entre léxico y modelo neuronal en tareas de transliteración.
- Preprocesado en pipelines de PLN para hindi: conversión de corpus romanizados a devanagari antes de pasarlos a modelos mayores de traducción o análisis, siempre que se acepten las restricciones de licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el test de hindi de Aksharantar, tarea de transliteración romanizado → devanagari a nivel de palabra:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 68,09% |
| Top-3 accuracy | 85,29% |
| Top-8 accuracy | 91,21% |

Comparaciones citadas por el autor en la model card:

| Sistema | Tamano de descarga | Top-1 |
|---|---|---|
| AksharaLP-Kosh-1.2M | 0,78 MB | 68,09% |
| Siguiente sistema mas pequeno medido | 0,87 MB | 65,89% |
| AksharaLP-1M | 4,53 MB | 70,37% (segun su propia card) |
| AksharaLP-1M-v2 | 7,92 MB | 70,04% |
| IndicXlit (modelo independiente, beam 8) | no disponible | 59,16% |
| IndicXlit (paquete completo, ~404 MB) | ~404 MB | 69,33% |

El autor indica ademas que, eliminando del léxico las 9.991 palabras de referencia del test, el modelo cae al 32,70% de top-1, lo que cuantifica la dependencia de la cobertura léxica.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el sistema está pensado para CPU y navegador.
- Cabe en cualquier GPU de consumo, pero no la necesita; también cabe en dispositivos móviles y navegadores de escritorio.
- Despliegue: runtime JavaScript propio sin dependencias, ejecutable en un Web Worker del navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario de los pesos.
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo afirma que decodifica palabra a palabra en el navegador de forma offline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (Aksharantar hindi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AksharaLP-Kosh-1.2M | 1.205.249 | No disponible (nivel de palabra) | 68,09% | CC BY-SA 4.0 | Hugging Face, 0,78 MB |
| AksharaLP-1M | No disponible | No disponible | 70,37% (segun su card) | No disponible en esta informacion | Hugging Face, 4,53 MB |
| AksharaLP-1M-v2 | No disponible | No disponible | 70,04% | Apache-2.0 | Hugging Face, 7,92 MB |
| IndicXlit | No disponible | No disponible | 59,16% (beam 8) / 69,33% (paquete completo) | No disponible en esta informacion | Paquete de ~404 MB |

## Limitaciones y advertencias

- Solo translitera, no traduce: convierte la escritura, no el significado.
- Dependencia fuerte del léxico: sin las palabras del test en la lista, el top-1 cae al 32,70%; los nombres propios nuevos, la jerga y las grafías poco frecuentes son el principal punto de fallo.
- Licencia CC BY-SA 4.0 con cláusula share-alike: el autor indica explícitamente que no se ofrece para uso comercial y que los pesos derivan en parte de datos CC BY-SA 4.0. Para uso comercial remite a AksharaLP-1M-v2 (Apache-2.0).
- Resultados de benchmarks no verificados (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- Cobertura lingüística limitada al hindi y su romanización; no soporta otras lenguas indias ni traducción entre idiomas.
- Sin información sobre sesgos, tasas de alucinación a nivel de palabra ni evaluación fuera del benchmark Aksharantar.
- Formato de pesos propietario y comprimido: no es compatible con los ecosistemas estándar (safetensors, GGUF) ni con servidores de inferencia convencionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no demostrados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourojitdotcom/AksharaLP-Kosh-1.2M
- Demo en vivo (Space): https://huggingface.co/spaces/sourojitdotcom/AksharaLP-Kosh-demo
- Alternativa comercial AksharaLP-1M-v2: https://huggingface.co/sourojitdotcom/AksharaLP-1M-v2
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
