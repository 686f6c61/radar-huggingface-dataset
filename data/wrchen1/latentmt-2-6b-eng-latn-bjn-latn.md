# wrchen1/LatentMT-2.6B-eng-latn-bjn-latn

## Resumen

LatentMT-2.6B-eng-latn-bjn-latn es un adaptador LoRA publicado por wrchen1 que implementa el par de traducción automática inglés-banjar (eng_Latn-bjn_Latn) descrito en el artículo *LatentMT: Machine Translation with Latent Reasoning* (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un modelo causal de 2.6 mil millones de parámetros con licencia Apache 2.0. La propuesta principal del trabajo es el uso de razonamiento latente: en lugar de generar cadenas de razonamiento explícitas como tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos, lo que permite mejorar la calidad de la traducción sin aumentar el coste de decodificación visible.

El adaptador está pensado para investigación en traducción automática y ofrece una configuración ligera y reutilizable. Según el artículo, LatentMT logra un rendimiento comparable a modelos de 3 a 5 veces más grandes en 32 direcciones de traducción que abarcan idiomas de alto, medio y bajo recursos. Este repositorio concreto se centra en el par inglés-banjar, con una profundidad recurrente de 4 pasos latentes. El tamaño del repositorio es de 0,1 GB, lo que refleja que solo se distribuyen los pesos del adaptador, no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base ByteDance/Ouro-2.6B-Thinking) con adaptador LoRA |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors y bin) |
| Idiomas soportados | ingles (eng_Latn) y banjar (bjn_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) y bin (adapter_model.bin) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo ByteDance/Ouro-2.6B-Thinking, un transformer causal de 2.6B parametros. La innovacion principal de LatentMT es el uso de "LoopLMs" con razonamiento latente: en lugar de generar tokens de razonamiento visibles, el modelo ejecuta pasos recurrentes adicionales dentro de los estados ocultos. En este adaptador concreto, la profundidad recurrente es de 4 pasos. El entrenamiento se describe como ligero (lightweight training), adaptando el modelo base con LoRA para la tarea de traduccion. No se especifican en la informacion disponible el tamano del dataset, la composicion de los datos ni si se emplearon tecnicas como RLHF o DPO. El articulo menciona que el sistema se evalua en 32 direcciones de traduccion, pero este repositorio solo cubre el par ingles-banjar.

## Capacidades

- Traduccion automatica del ingles al banjar (idioma austronesio hablado en Indonesia).
- Razonamiento latente: los pasos recurrentes se ejecutan en estados ocultos, sin generar tokens de razonamiento visibles, lo que reduce el coste de decodificacion.
- Integracion sencilla mediante la libreria PEFT (PeftModel) con transformers.
- Compatible con el ecosistema Hugging Face: carga directa con `AutoModelForCausalLM` y `PeftModel`.
- No se mencionan capacidades adicionales como tool calling, agentes, vision o audio.

## Casos de uso

- Traduccion de contenido web del ingles al banjar: el adaptador puede integrarse en un pipeline de traduccion para generar versiones en banjar de articulos, noticias o documentacion, aprovechando la ventana de contexto del modelo base (aunque no se especifica su longitud).
- Investigacion en traduccion automatica de bajo recursos: el banjar es un idioma con pocos recursos digitales; este adaptador permite estudiar el comportamiento de modelos pequenos con razonamiento latente en pares de lenguas minoritarias.
- Prototipado rapido de sistemas de traduccion: al ser un adaptador LoRA, se puede cargar sobre el modelo base con pocos recursos de memoria y probar en entornos de desarrollo.
- Evaluacion comparativa de tecnicas de razonamiento latente: los investigadores pueden comparar este adaptador con versiones que usan chain-of-thought explicito u otros metodos de decodificacion.
- Integracion en aplicaciones de traduccion asistida: por su tamano reducido (2.6B), puede desplegarse en servidores modestos o incluso en equipos de escritorio con GPU consumer.
- Generacion de datos sinteticos: el modelo puede usarse para crear pares de entrenamiento ingles-banjar, util para otros sistemas de traduccion o para aumentar corpus existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para el par ingles-banjar en la informacion disponible. El articulo menciona que LatentMT alcanza un rendimiento comparable a modelos de 3 a 5 veces mas grandes en 32 direcciones de traduccion, pero no se proporcionan cifras concretas (p. ej., BLEU, chrF) en la documentacion accesible.

## Requisitos de hardware

- VRAM estimada: el modelo base Ouro-2.6B-Thinking requiere aproximadamente 5-6 GB en FP16 (2.6B parametros * 2 bytes). El adaptador LoRA anade una cantidad minima (menos de 0.1 GB). Con cuantizacion a 8 bits o 4 bits, la VRAM podria reducirse a 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060, RTX 3090, RTX 4090) puede ejecutar el modelo en FP16. Para cuantizacion, una GPU con 6 GB podria ser suficiente.
- Despliegue: se puede usar con transformers y PEFT directamente, o mediante vLLM, llama.cpp u Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador. Tambien es compatible con TGI (Text Generation Inference).
- Latencia y throughput: no se proporcionan datos especificos. Al ser un modelo de 2.6B, la generacion es relativamente rapida en GPUs modernas, pero depende del hardware y de la configuracion de decodificacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificamente para el par ingles-banjar. En el ambito de traduccion multilingue, alternativas como NLLB-200 (Meta) o M2M-100 cubren muchos idiomas, pero no se han encontrado datos de rendimiento para banjar en la informacion disponible. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El adaptador esta disenado exclusivamente para el par ingles-banjar; no es un modelo multilingue general.
- Al ser un adaptador LoRA, requiere el modelo base ByteDance/Ouro-2.6B-Thinking para funcionar; no es un modelo autonomo.
- No se especifican sesgos conocidos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinacion en traducciones: como cualquier modelo generativo, puede producir traducciones incorrectas o inventadas, especialmente en contextos ambiguos.
- La longitud de contexto no se ha documentado; se recomienda verificar la configuracion del modelo base.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (tambien Apache 2.0 segun la informacion).
- El articulo indica que el modelo esta orientado a investigacion; no se garantiza su idoneidad para produccion sin evaluacion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-bjn-latn
- Articulo arXiv (PDF): https://arxiv.org/pdf/2607.18618
- Articulo arXiv (HTML): https://arxiv.org/html/2607.18618v1
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
