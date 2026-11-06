# wyf-yfw/MiniSeek-V1

## Resumen

MiniSeek-V1 es un modelo de lenguaje de tipo decoder-only con arquitectura MoE (Mixture of Experts) de tamano ultra reducido, desarrollado por el autor independiente wyf-yfw bajo la serie MiniSeek-M. Con 186.933.744 parametros totales (aproximadamente 186,93 M), se posiciona como un experimento de alineacion con la filosofia de DeepSeek (transicion de denso a MoE y de base a chat) pero a una escala muy inferior. El checkpoint publicado es la version SFT/chat, afinada sobre el modelo base MiniSeek-V1-base.

El modelo emplea una estructura propia denominada CED + MoE con 1+64 expertos y enrutamiento top-6, complementada con los componentes mHC y Engram. Utiliza el tokenizador MiniMind con un vocabulario de 6400 tokens y plantilla ChatML. Su ventana de contexto en la fase SFT es de solo 256 tokens, lo que lo situa en un regimen de uso muy restringido y alejado de los asistentes de produccion actuales.

Su relevancia es fundamentalmente didactica y de investigacion: demuestra como construir y entrenar un MoE funcional a escala de laboratorio con recursos minimos, publicando pesos en safetensors bajo licencia MIT. No obstante, el propio autor advierte que se trata de un modelo no apto para produccion, con capacidades limitadas a respuestas cortas en chino y un rendimiento debil en ingles, codigo y razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only MoE (CED + MoE 1+64 top-6 + mHC + Engram) |
| Parametros totales | 186.933.744 (~186,93 M) |
| Parametros activos | no disponible (top-6 de 64 expertos; el numero exacto de parametros activos no se publica) |
| Longitud de contexto | 256 tokens (fase SFT) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con capas MoE de tipo 1+64 expertos y enrutamiento top-6, es decir, un experto compartido mas 64 expertos especializados de los que se activan los 6 mas relevantes por token. Incorpora ademas los modulos propietarios mHC y Engram, y no comparte los pesos de embedding con la cabeza LM (LM Head). El tokenizador es MiniMind con vocab_size=6400 y se emplea la plantilla de chat ChatML.

El entrenamiento parte del checkpoint base MiniSeek-V1-base y realiza un SFT sobre el dataset sft_miniseek_v5_short256.jsonl, con max_seq_len de 256 y batch de 24 en modo pack. Se uso el optimizador AdamW con un pico de learning rate de 5e-5 decaendo hasta 1e-6, warmup de 100 pasos y un coeficiente auxiliar de balanceo de expertos (aux_coef) de 1e-4. El mejor checkpoint publicado corresponde al paso 36428 con una perdida de entrenamiento de aproximadamente 1,4276. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional de tipo chat mediante plantilla ChatML.
- Respuestas cortas en chino con calidad aceptable segun el autor.
- Comprension y generacion basica en ingles, aunque con rendimiento debil.
- Razonamiento simple y respuesta a preguntas factuales muy directas (por ejemplo, capitales).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking).
- Capacidad multilingue limitada a zh y en.

## Casos de uso

- Experimentacion academica con arquitecturas MoE: sirve para estudiar el comportamiento del enrutamiento top-6 sobre 64 expertos en un modelo que cabe en una sola GPU, permitiendo analizar balanceo de carga y uso de expertos.
- Prototipado rapido de pipelines de chat: permite validar plantillas ChatML, tokenizadores y flujos de generacion antes de escalar a modelos mayores.
- Docencia sobre entrenamiento SFT: el checkpoint y su configuracion (AdamW, LR, warmup, aux_coef) constituyen un ejemplo reproducible de un ciclo completo de fine-tuning.
- Pruebas de integracion de la libreria miniseek_m: util para verificar la carga de pesos safetensors y la API de generacion en entornos de desarrollo.
- Generacion de respuestas cortas en chino para tareas de clasificacion o extraccion muy acotadas dentro de 256 tokens.
- Benchmarking de infraestructura: al ser tan pequeno, permite medir latencia y throughput de frameworks de inferencia en hardware de gama baja sin coste elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 186,93 M de parametros, los pesos en fp32 ocupan aproximadamente 0,75 GB; en fp16 alrededor de 0,37 GB. La VRAM total necesaria es inferior a 1-2 GB incluyendo activaciones y cache, aunque no se publican mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1660, RTX 3060, RTX 4090 e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: la carga oficial se realiza con PyTorch y la libreria propia miniseek_m mediante safetensors. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se distribuyen pesos en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniSeek-V1 | ~186,93 M | 256 | MoE decoder-only | MIT | Hugging Face (safetensors) |
| MiniSeek-M0.1 | no disponible | no disponible | MoELM (SFT) | no disponible | Hugging Face |
| MiniMind (tokenizador de referencia) | no disponible | no disponible | no disponible | no disponible | Referenciado por el autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros y disponibilidad; no se conocen alternativas de la misma categoria con benchmarks publicados en esta ficha.

## Limitaciones y advertencias

- Modelo explicitamente no apto para produccion segun el propio autor.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Rendimiento debil en ingles, generacion de codigo y razonamiento complejo (fase SFT temprana).
- Riesgo elevado de alucinacion y respuestas incorrectas fuera de dominios muy simples.
- Sesgos conocidos: no documentados, pero al entrenarse principalmente con datos en chino puede presentar sesgos linguisticos y culturales.
- Licencia MIT: permite uso comercial, pero sin garantias ni soporte del autor.
- Dependencia de la libreria propietaria miniseek_m para cargar el modelo, lo que limita la portabilidad frente a transformers estandar.
- Ausencia de cuantizaciones oficiales (GGUF, AWQ, GPTQ) y de integracion con frameworks de inferencia populares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-V1
- Modelo base: https://huggingface.co/wyf-yfw/MiniSeek-V1-base
- Repositorio de codigo: https://github.com/wyf-yfw/miniseek
- Modelo previo de la serie: https://huggingface.co/wyf-yfw/MiniSeek-M0.1
