# ViuAI/ViuAI-500M

## Resumen

ViuAI Sarus-500M es un modelo de lenguaje pequeno (SLM) de 495 millones de parametros, desarrollado y entrenado desde cero por ViuAI Research. Se presenta como un modelo autoregresivo denso orientado a despliegue en dispositivos de borde (edge) y entornos con recursos limitados, con una huella de pesos de aproximadamente 944 MB. Su identidad nativa es "Sarus" y esta disenado para ofrecer respuestas conversacionales directas sin tokens internos de razonamiento.

La arquitectura es un transformer denso de 24 capas con atencion de consultas agrupadas (GQA) en una proporcion 5:1 (20 cabezas de consulta frente a 4 de clave/valor), lo que reduce el coste de memoria durante la decodificacion. Emplea SwiGLU en la FFN, RMSNorm con pre-normalizacion, embeddings posicionales rotatorios (RoPE con theta 10.000) y atado de pesos entre la cabeza de salida y el embedding de tokens. La longitud de contexto es de 2.048 tokens y el vocabulario es de 64.003 tokens con tokenizador BPE a nivel de byte.

El modelo se alinea mediante ajuste supervisado (SFT) en 21 dominios estructurados y posteriormente con Optimizacion de Preferencias Directas (DPO), con un checkpoint final denominado DPO-5K. Su relevancia actual radica en la demanda de modelos pequenos que puedan ejecutarse en CPU y hardware de consumo con baja latencia, aunque su ventana de contexto y su limitacion al ingles acotan su alcance frente a SLM mas recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo con GQA, SwiGLU, RMSNorm y RoPE |
| Parametros totales | 494.866.432 (~495M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos distribuidos en .pt; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt); no se distribuyen safetensors pese a la etiqueta del repo |

## Arquitectura y entrenamiento

Sarus-500M es un transformer denso de 24 bloques con dimension oculta de 1.280 y dimension intermedia de FFN de 3.456 con activacion SwiGLU. La atencion usa 20 cabezas de consulta y 4 de clave/valor (GQA 5:1), lo que reduce el tamano de la cache KV y acelera la decodificacion en CPU. La normalizacion es RMSNorm con epsilon 1e-5 aplicada antes de atencion y FFN, y la cabeza de lenguaje comparte pesos con el embedding de tokens (weight tying). El tokenizador es BPE a nivel de byte con 64.003 entradas y tokens especiales explicitos para turnos: `<|user|>` (64000), `<|assistant|>` (64001) y `<|endofturn|>` (64002).

El entrenamiento se realizo desde cero y consta de dos fases: un ajuste supervisado (SFT) sobre 21 dominios estructurados que incluyen STEM de NCERT (clases 6 a 12), historia y politica de la India, seguimiento de instrucciones y logica; y una fase posterior de alineacion con DPO que produce el checkpoint recomendado DPO-5K. No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del corpus ni detalles del dataset de preferencias. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles con respuestas directas y sin tokens internos de pensamiento.
- Seguimiento de instrucciones y respuesta a preguntas enciclopedicas basicas (STEM, historia y politica de la India).
- Razonamiento logico sencillo segun los dominios de entrenamiento SFT.
- Conversacion multiturno mediante el formato de delimitadores `<|user|>`, `<|assistant|>` y `<|endofturn|>`.
- Autopresentacion con identidad nativa ("Sarus").
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Asistentes conversacionales en dispositivos de borde: el modelo cabe en aproximadamente 944 MB y puede ejecutarse en CPU, lo que permite integrarlo en aplicaciones de escritorio, moviles o dispositivos embebidos con baja latencia y sin GPU dedicada.
- Respuesta a preguntas educativas de nivel escolar: su SFT sobre STEM de NCERT (clases 6 a 12) lo hace util para tutoria automatizada de matematicas y ciencias basicas en ingles.
- Chatbot de atencion al cliente de dominio acotado: con 2.048 tokens de contexto puede gestionar conversaciones cortas multiturno sobre un conjunto limitado de temas, siempre que se acepte su ventana reducida.
- Prototipado rapido y pruebas de concepto: su licencia Apache 2.0 y su baja huella permiten experimentar con pipelines de generacion de texto sin infraestructura costosa.
- Filtrado y clasificacion ligera de texto: puede emplearse para generar respuestas cortas o reformulaciones en tareas de preprocesamiento donde no se requiera alta precision.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse localmente en CPU, evita el envio de datos a servicios en la nube, adecuado para aplicaciones sensibles a la confidencialidad.
- Base para fine-tuning especifico: al ser un modelo pequeno con licencia permisiva, sirve como punto de partida para ajustes en dominios concretos con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en precision de 16 bits (pesos de 944 MB) mas la cache KV; en CPU el consumo de RAM es similar.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos 2 GB de memoria es suficiente (por ejemplo, GTX 1650, RTX 3050 o superiores). Tambien puede ejecutarse en A100 o H100, aunque no es su objetivo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con 2 GB o mas de VRAM.
- Ejecucion en CPU: si, es uno de sus objetivos principales; la GQA 5:1 reduce la cache KV y acelera la decodificacion.
- Opciones de despliegue: el autor proporciona un script de inferencia directa con `torch`, `tokenizers` y `huggingface_hub`, sin requerir `transformers`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ViuAI Sarus-500M | ~495M | 2.048 | Apache 2.0 | Hugging Face (.pt) | Ingles, SFT + DPO, sin benchmarks publicados |
| Qwen2.5-0.5B | ~494M | 32.768 | Apache 2.0 | Hugging Face (safetensors, GGUF) | Multilingue, amplia adopcion, benchmarks publicados |
| SmolLM2-360M | ~360M | 8.192 | Apache 2.0 | Hugging Face (safetensors, GGUF) | Multilingue, optimizado para edge, benchmarks publicados |
| TinyLlama-1.1B | ~1.1B | 2.048 | Apache 2.0 | Hugging Face (safetensors, GGUF) | Mayor tamano, ecosistema amplio |

Los datos de los modelos comparables corresponden a informacion publica general; no se dispone de comparaciones directas de rendimiento con Sarus-500M en la informacion proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Al ser un modelo de 495M, la probabilidad de alucinacion en hechos especificos es elevada; requiere verificacion en produccion.
- El SFT se centra en dominios concretos (STEM escolar, historia y politica de la India), lo que puede introducir sesgos y lagunas de conocimiento fuera de esos ambitos.
- No se documentan evaluaciones de sesgo ni de seguridad; se desconoce el comportamiento ante prompts adversarios.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio ocupa 840,2 GB segun Hugging Face, lo que sugiere la presencia de checkpoints intermedios voluminosos; conviene descargar solo los archivos necesarios (`code/model.py`, `code/config.py`, `tokenizer.json` y `dpo_checkpoints/dpo_5k/dpo_5k_final.pt`).
- La etiqueta del repositorio indica `safetensors`, pero los pesos se distribuyen como `.pt`; es necesario cargarlos con `torch.load` y limpiar prefijos (`_orig_mod.`, `module.`) segun el script del autor.
- No se documenta integracion con frameworks de inferencia estandar (vLLM, TGI, llama.cpp), lo que complica el despliegue en produccion a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ViuAI/ViuAI-500M
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
