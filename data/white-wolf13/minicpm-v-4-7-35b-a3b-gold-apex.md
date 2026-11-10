# White-Wolf13/MiniCPM-V-4.7-35B-A3B-GOLD-APEX

## Resumen

MiniCPM-V-4.7-35B-A3B-GOLD-APEX es una cuantizacion GGUF de la serie GOLD, derivada del modelo base openbmb/MiniCPM-V-4.7-35B-A3B, un Mixture-of-Experts (MoE) disperso de aproximadamente 34.660 millones de parametros totales con unos 3.000 millones activos por token (denominacion A3B). El autor de la cuantizacion es White-Wolf13, que distribuye el artefacto bajo licencia Apache 2.0 y lo etiqueta con los identificadores qwen y qwen3.6, lo que sugiere que el modelo base emplea una arquitectura de la familia Qwen.

El modelo resuelve el problema de desplegar un MoE de 35B en hardware de consumo mediante una asignacion de bits quirurgica (perfiles APEX-I) que preserva en FP32 las compuertas del router (`ffn_gate_inp`) y en FP16 el experto compartido (`ffn_down_shexp`), evitando la deriva de enrutamiento tipica de las cuantizaciones uniformes en arquitecturas de 256 expertos. La calibracion se realiza sobre un proxy de referencia propio con suelo de Q6_K y un corpus de 196 fragmentos de 16.384 tokens (mas de 3,2 millones de tokens).

Es relevante ahora porque ofrece cinco perfiles que caben desde 12 GB hasta 26,7 GiB de VRAM, con soporte nativo de cadenas de razonamiento `<think>`, tool calling y uso bilingue ingles-polaco. La model card describe el proceso de refinamiento como una "alineacion de variedad latente y calibracion espectral" propietaria, sin publicar detalles verificables del procedimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) disperso, transformer con GQA (`head_count_kv = 2`), 256 expertos segun la model card |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (denominacion A3B); cifra exacta no disponible |
| Longitud de contexto | No disponible en la informacion proporcionada (la model card menciona ventanas de 32k-64k+ en las recomendaciones de hardware) |
| Tipos de cuantizacion | GGUF APEX-I en cinco perfiles: PRO (~6,62 BPW), QUALITY (~5,77 BPW), BALANCED (~5,19 BPW), COMPACT (~3,89 BPW), MINI (~2,80 BPW); router en FP32 y experto compartido en FP16 |
| Idiomas soportados | Ingles (en) y polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE disperso con 256 expertos y atencion GQA con solo 2 cabezas KV, lo que reduce drasticamente el tamano del KV cache y permite contextos largos con poca VRAM adicional. El autor no publica el numero de tokens de entrenamiento ni la composicion del dataset del modelo base; solo indica que la cuantizacion se calibro con 196 fragmentos de 16.384 tokens (mas de 3,2 millones de tokens) que cubren tool calling, logica multiturno, sintesis de codigo y dialogo enciclopedico multidominio.

El refinamiento GOLD se describe como un proceso de "alineacion de variedad latente y calibracion espectral en el espacio de pesos" seguido de una segunda etapa de fusion no revelada, en lugar de un fine-tuning por descenso de gradiente. No se aportan datos verificables sobre esta metodologia, ni sobre el uso de RLHF o DPO. La innovacion tecnica documentada de forma concreta es la pipeline Enhanced APEX-I de cuantizacion: proteccion del router en FP32, estabilizacion del experto compartido en FP16, asignacion asimetrica de bits segun la energia de activacion de SwiGLU y calibracion iMatrix sobre un proxy con suelo Q6_K.

## Capacidades

- Generacion de texto conversacional y de rol (roleplay), con estilo directo y sin hedging excesivo segun el autor.
- Razonamiento multi-paso nativo mediante cadenas `<think>` estructuradas antes de la respuesta final.
- Generacion y analisis de codigo, incluyendo sintesis en dominios de programacion complejos.
- Tool calling y function calling, entrenado y calibrado explicitamente con corpus de llamadas a herramientas.
- Razonamiento agentico multiturno y simulacion de escenarios.
- Capacidades bilingues en ingles y polaco, con fluidez destacada en ambos segun la model card.
- Aunque el modelo base (MiniCPM-V) es multimodal, la model card de esta cuantizacion solo declara `pipeline_tag: text-generation`; no se confirma soporte de vision en el artefacto GGUF.

## Casos de uso

- Asistente de codigo en produccion: el perfil QUALITY (23,29 GiB) cabe en una RTX 4090 y permite integrar el modelo en pipelines de revision de codigo o generacion de parches con tool calling.
- Agente de atencion al cliente multilingue: con soporte de ingles y polaco y cadenas de razonamiento, puede gestionar conversaciones multiturno y derivar a herramientas internas mediante function calling.
- Despliegue en estaciones de trabajo de 12 GB: el perfil MINI (11,29 GiB) permite aceleracion completa en GPUs como RTX 3060 o RTX 4070 para prototipado y asistentes locales.
- Servidor de razonamiento en 24 GB: el perfil BALANCED (20,95 GiB) deja 3-4 GiB de margen para contextos de 32k-64k, adecuado para analisis de documentos largos.
- Generacion de contenido creativo y roleplay: el refinamiento GOLD esta orientado a fidelidad de intencion y estilo, util para escritura asistida y simulacion de personajes.
- Investigacion sobre cuantizacion de MoE: los perfiles APEX-I sirven como referencia para estudiar el impacto de preservar el router en FP32 frente a cuantizaciones uniformes en arquitecturas de 256 expertos.
- Inferencia hibrida CPU/GPU: el perfil PRO (26,73 GiB) con `-ngl 14` permite repartir capas entre 12 GB de VRAM y 32 GB de RAM en equipos sin GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por perfil: PRO 26,73 GiB (dual GPU 2x16 GB o hibrido 32 GB RAM + 12 GB VRAM); QUALITY 23,29 GiB (RTX 3090/4090 24 GB); BALANCED 20,95 GiB (24 GB con margen para contexto extendido); COMPACT 15,69 GiB (RTX 4080, Tesla T4, V100 16 GB); MINI 11,29 GiB (RTX 3060, RTX 4070 12 GB).
- GPU recomendadas: RTX 4090 o RTX 3090 para QUALITY y BALANCED; RTX 4080, T4 o V100 para COMPACT; RTX 3060/4070 para MINI; configuracion multi-GPU o hibrida para PRO.
- Cabe en GPU de consumo: si, desde 12 GB con el perfil MINI hasta 24 GB con QUALITY.
- Opciones de despliegue: llama.cpp y llama-server (formato nativo GGUF); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, aunque no se detalla la integracion con vLLM, TGI u Ollama.
- Ajustes recomendados: Flash Attention activado (`-fa on`), `-ngl` ajustado al perfil, temperatura 0,6 y top-k 20 segun el ejemplo de la model card. No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V-4.7-35B-A3B-GOLD-APEX | 34,66 B totales / ~3 B activos | No disponible | Apache 2.0 | GGUF | Cuantizacion APEX-I con router FP32 |
| openbmb/MiniCPM-V-4.7-35B-A3B (base) | 34,66 B totales / ~3 B activos | No disponible | Apache 2.0 | Safetensors (segun dato real) | Modelo original sin refinamiento GOLD |
| Alternativas MoE de ~30-35 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar entrenado principalmente en ingles y polaco, el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos; las cadenas `<think>` no eliminan errores factuales.
- El proceso de refinamiento GOLD ("alineacion de variedad latente", "fusion no revelada") no es verificable ni reproducible; conviene tratar las afirmaciones de rendimiento del autor con cautela.
- La model card solo declara `text-generation`; no se confirma que el artefacto GGUF conserve las capacidades de vision del modelo base MiniCPM-V.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus componentes deben cumplir tambien sus propias condiciones.
- El repositorio tiene 105,2 GB y cinco perfiles; verificar el archivo descargado y su hash antes de desplegar en produccion.
- No hay benchmarks publicados que permitan validar las afirmaciones de calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/White-Wolf13/MiniCPM-V-4.7-35B-A3B-GOLD-APEX
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- llama.cpp: https://github.com/ggml-org/llama.cpp
