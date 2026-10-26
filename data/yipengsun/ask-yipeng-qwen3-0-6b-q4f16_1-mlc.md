# yipengsun/ask-yipeng-Qwen3-0.6B-q4f16_1-MLC

## Resumen

ask-yipeng-Qwen3-0.6B-q4f16_1-MLC es una adaptación del modelo Qwen3-0.6B de Alibaba Qwen, publicada por el desarrollador yipengsun, que la utiliza como asistente de preguntas y respuestas sobre su web personal. No se trata de un modelo de propósito general nuevo: es un fine-tune con LoRA sobre el modelo base, fusionado y cuantizado al formato MLC `q4f16_1` para ejecutarse íntegramente en el navegador del visitante mediante WebLLM y WebGPU, sin backend ni API externa. El repositorio ocupa 0,3 GB y la descarga inicial ronda los 335 MB.

El problema que resuelve es acotado y muy concreto: lograr que un modelo de 0,6 mil millones de parámetros responda en primera persona, en una a tres frases, usando exclusivamente una hoja de datos (fact sheet) inyectada en el system prompt, y que decline educadamente cuando la información no cubre la pregunta. El fine-tune no memoriza hechos; entrena tres comportamientos: estilo breve en primera persona, grounding estricto en el system prompt y rechazo explícito con derivación al correo de contacto.

Su relevancia es fundamentalmente metodológica: demuestra un patrón completo y reproducible de despliegue de LLM en el borde (edge), con anclaje documental, rechazo calibrado y una evaluación comparativa frente al modelo base. Además, al reutilizar exactamente el layout de tensores de la release oficial `mlc-ai/Qwen3-0.6B-q4f16_1-MLC`, funciona con la librería WebGPU precompilada de WebLLM sin necesidad de compilar artefactos propios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredero de Qwen3-0.6B); fine-tune LoRA fusionado; formato MLC para WebGPU |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens configurados en el ejemplo de WebLLM mediante `overrides.context_window_size`; máximo nativo del modelo base no especificado en la información disponible |
| Tipos de cuantizacion | MLC `q4f16_1`: cuantización de grupo de 4 bits, tamaño de grupo 32, escalas en float16 |
| Idiomas soportados | Inglés (en), alemán (de), chino (zh) |
| Licencia | Apache 2.0 (idéntica al modelo base) |
| Formato de pesos | MLC (`tensor-cache.json` más shards de pesos cuantizados); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es Qwen3-0.6B, un transformer decoder-only de 0,6 mil millones de parámetros. Sobre él se aplicó un LoRA con r = 16, alpha = 32 y dropout 0,05, cubriendo todas las proyecciones de atención y de MLP. El adaptador se fusionó en los pesos y el conjunto se cuantizó a MLC `q4f16_1`, con grupo de 4 bits de tamaño 32 y escalas float16. El entrenamiento se ejecutó con 3 épocas, batch efectivo de 16, 150 pasos de optimizador, tasa de aprendizaje 2e-4 y precisión bf16, en una única NVIDIA A100 de 40 GB durante unos 5 minutos. El modo de razonamiento extendido quedó desactivado (`enable_thinking=False`), lo que reduce la latencia y evita cadenas de pensamiento en un caso de uso conversacional breve.

El dataset son 787 pares sintéticos pregunta-respuesta: 664 en inglés, 62 en alemán y 61 en chino, cada uno acompañado de la hoja de datos como system prompt. 252 de ellos son preguntas que el sitio no puede responder, es decir, ejemplos deliberados de rechazo. Se aplicó un filtro de calidad que descartaba respuestas que mencionasen una entidad o un número ausente de la hoja de datos, lo que refuerza el comportamiento de anclaje documental. No se documenta en la información disponible el uso de RLHF o DPO; el procedimiento descrito es un supervised fine-tuning ligero.

La verificación técnica de la cuantización es notable: el conversor se ejecutó también sobre los pesos originales de Qwen3-0.6B y su salida coincidió byte a byte con los 339 tensores de la release `mlc-ai/Qwen3-0.6B-q4f16_1-MLC`. Esa equivalencia de layout es lo que permite usar la librería WebGPU precompilada de WebLLM en lugar de compilar una propia.

## Capacidades

- Generación de texto conversacional breve: respuestas de una a tres frases, en primera persona.
- Anclaje estricto a un contexto documental inyectado en el system prompt (grounding sobre fact sheet).
- Rechazo calibrado: cuando los hechos no cubren la pregunta, declina y remite al correo de contacto.
- Multilingüe limitado a inglés, alemán y chino, con 664, 62 y 61 ejemplos de entrenamiento respectivamente.
- Ejecución íntegra en el navegador del cliente mediante WebLLM y WebGPU, sin servidor.
- Inferencia en modo no-thinking, adecuada para respuestas de baja latencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada; el fine-tune está orientado explícitamente a respuestas cortas y de un solo turno.
- Capacidades de visión o audio: no disponibles.
- Capacidades de código y matemáticas: no evaluadas ni documentadas para este fine-tune.

## Casos de uso

- Asistente de FAQ personal en una web: el modelo recibe una hoja de datos generada a partir del contenido público del sitio y responde en primera persona en una a tres frases, con descarga de unos 335 MB que el navegador cachea tras la primera carga.
- Chatbot de producto con anclaje documental: sirve para responder dudas sobre un catálogo o una política concreta, con la garantía de que el modelo declina en lugar de improvisar cuando el dato no está en el prompt de sistema.
- Despliegue con requisito de privacidad: al ejecutarse en el dispositivo del usuario, ninguna consulta ni dato personal abandona el navegador, lo que encaja en escenarios con RGPD estricto o datos sensibles.
- Demostración de fine-tuning y cuantización para WebGPU: el repositorio funciona como referencia reproducible de pipeline LoRA + MLC + WebLLM, con un coste de entrenamiento de minutos en una A100.
- Asistente de documentación técnica offline: empaquetado como PWA, permite consultar guías y manuales sin conectividad una vez cacheado el modelo.
- Atención multilingüe de alcance limitado: útil para sitios con audiencia en inglés, alemán y chino, siempre que las respuestas se limiten a hechos suministrados en el contexto.
- Prototipado rápido de productos conversacionales: permite validar flujos de conversación y de rechazo antes de invertir en un modelo mayor o en infraestructura de servidor.
- Filtro de primera línea en soporte: puede resolver consultas frecuentes cubiertas por la hoja de datos y escalar al correo o a un humano el resto, dado su comportamiento de rechazo entrenado explícitamente.

## Benchmarks y rendimiento

Evaluación propia sobre 60 preguntas retenidas (42 respondibles desde la hoja de datos y 18 no respondibles), no presentes en el entrenamiento, mismo system prompt y decodificación greedy para ambos modelos. La corrección fue evaluada a ciegas por Claude Haiku, sin conocer qué modelo generó cada respuesta.

| Metrica | Modelo base | Fine-tune |
|---|---|---|
| Respuestas con alguna afirmación no respaldada por la hoja de datos | 28 / 60 | 2 / 60 |
| Rechazos correctos (de 18 preguntas no respondibles) | 6 / 18 | 16 / 18 |
| Respuestas correctas (de 42 preguntas respondibles) | 25 / 42 | 37 / 42 |
| Rechazos de preguntas que sí eran respondibles | 2 / 60 | 0 / 60 |

Estos valores corresponden al modelo en bf16, antes de la cuantización. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en el navegador del cliente: requiere un navegador con soporte de WebGPU y una GPU integrada o dedicada compatible; no necesita GPU de servidor.
- Huella de pesos: 335 MB de descarga en cuantización `q4f16_1`. Estimación de memoria de vídeo en torno a 0,5-1 GB incluyendo pesos y caché KV a 4.096 tokens, calculada a partir del tamaño de los pesos; no es un dato publicado por el autor.
- GPU de escritorio: cualquier GPU con WebGPU operativo (por ejemplo, generaciones recientes de NVIDIA, AMD o Apple Silicon) puede ejecutar el modelo; no se especifican modelos concretos ni umbrales mínimos en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño (0,6 B de parámetros en 4 bits); el cuello de botella es el soporte de WebGPU del navegador, no la VRAM.
- Opciones de despliegue: WebLLM sobre MLC-LLM con la librería WebGPU precompilada `Qwen3-0.6B-q4f16_1_cs1k-webgpu.wasm`. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están soportados por este repositorio, ya que el formato es específico de MLC y no se publican pesos en GGUF ni safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware del visitante y del tiempo de compilación de shaders en la primera carga.
- Entrenamiento del fine-tune: una NVIDIA A100 de 40 GB durante aproximadamente 5 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| ask-yipeng-Qwen3-0.6B-q4f16_1-MLC | 0,6 B | 4.096 configurados | MLC `q4f16_1`, WebGPU en navegador | Apache 2.0 | Fine-tune LoRA con rechazo entrenado; 2/60 afirmaciones no respaldadas y 16/18 rechazos correctos |
| Qwen/Qwen3-0.6B (base) | 0,6 B | No disponible en la información proporcionada | Safetensors bf16 | Apache 2.0 | Sin fine-tune: 28/60 afirmaciones no respaldadas y 6/18 rechazos correctos en el mismo test |
| mlc-ai/Qwen3-0.6B-q4f16_1-MLC | 0,6 B | No disponible en la información proporcionada | MLC `q4f16_1`, WebGPU | Apache 2.0 | Release oficial de MLC con layout de tensores idéntico (339 tensores verificados byte a byte) |

Como alternativas de la misma categoría (modelos de menos de 1 B parámetros para despliegue en el borde) podrían considerarse familias como SmolLM2 o Llama 3.2 1B, pero no se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento ni licencia verificados para compararlas aquí, por lo que se indica "no disponible" en lugar de inferir cifras.

## Limitaciones y advertencias

- El propio autor advierte de que un modelo de 0,6 B puede equivocarse; el sitio recomienda verificar los detalles importantes por correo. El riesgo de alucinación persiste pese al fine-tune, aunque baja de 28/60 a 2/60 afirmaciones no respaldadas en el test interno.
- El modelo no memoriza hechos: su corrección depende por completo de la calidad y cobertura de la hoja de datos inyectada en el system prompt. Si esa hoja cambia, el comportamiento no está garantizado sin reevaluar.
- El conjunto de evaluación es pequeño (60 preguntas, 42 respondibles y 18 no respondibles) y la corrección la realiza un modelo (Claude Haiku) como juez, lo que introduce posibles sesgos del evaluador y un margen de error amplio en las métricas.
- Cobertura lingüística muy desequilibrada: 664 ejemplos en inglés frente a 62 en alemán y 61 en chino. El rendimiento fuera del inglés puede degradarse y no se reportan métricas por idioma.
- El modo de razonamiento extendido está desactivado; el modelo no es adecuado para tareas que requieran cadenas de pensamiento largas, cálculo complejo o razonamiento multi-paso.
- La cuantización a 4 bits con grupo 32 puede introducir degradación adicional respecto a los valores reportados, que corresponden al modelo en bf16 antes de cuantizar. No se publican métricas post-cuantización.
- El formato es exclusivo de MLC/WebLLM: no hay pesos en safetensors ni GGUF, lo que impide usarlo directamente con vLLM, llama.cpp, Ollama o TGI.
- El ejemplo de uso sobreescribe `context_window_size` a 4.096 mientras que la librería precompilada referenciada es `cs1k`; conviene verificar que ese override funcione con la librería indicada o recompilarla, ya que de lo contrario el contexto efectivo podría quedar limitado.
- No se documentan sesgos conocidos, auditorías de seguridad ni pruebas de red teaming en la información disponible.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se heredan las condiciones del modelo base Qwen3-0.6B; no se detallan obligaciones adicionales de atribución en la información proporcionada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación de la comunidad ni informes independientes de comportamiento en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yipengsun/ask-yipeng-Qwen3-0.6B-q4f16_1-MLC
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Release oficial MLC con layout idéntico: https://huggingface.co/mlc-ai/Qwen3-0.6B-q4f16_1-MLC
- WebLLM (repositorio): https://github.com/mlc-ai/web-llm
- WebLLM en CDN (v0.2.86): https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.86/lib/index.js
- Librería WebGPU precompilada: https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_86/base/Qwen3-0.6B-q4f16_1_cs1k-webgpu.wasm
- Sitio personal donde se despliega: https://yipengsun.com/

Nota: la búsqueda web realizada no devolvió resultados pertinentes al modelo (los enlaces obtenidos corresponden a la obra literaria "Sur les chemins noirs" y no guardan relación con este repositorio), por lo que no se incluyen como referencias técnicas.
