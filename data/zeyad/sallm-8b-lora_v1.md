# Zeyad/SaLLM-8B-LoRA_V1

## Resumen

SaLLM-8B-LoRA_V1 es un adaptador LoRA (PEFT) publicado por el usuario Zeyad en Hugging Face, entrenado mediante SFT sobre el checkpoint cuantizado en 4 bits `unsloth/Qwen3-8B-unsloth-bnb-4bit`, es decir, sobre la familia Qwen3-8B. No se trata por tanto de un modelo completo con pesos propios, sino de un conjunto de matrices de bajo rango (~0,2 GB en safetensors) que deben cargarse junto al modelo base o fusionarse con él para su uso en inferencia.

El repositorio es un caso claro de publicación en estado embrionario: la model card es la plantilla por defecto de Hugging Face sin rellenar (todos los campos figuran como "[More Information Needed]"), no se declara licencia ni idiomas, y el modelo acumula 0 descargas y 0 likes en el momento de la consulta. El pipeline declarado es `text-generation` y las etiquetas indican `lora`, `sft`, `trl` y `unsloth`, lo que sugiere un ajuste supervisado ligero orientado a conversación.

Su relevancia actual es limitada y de carácter experimental: sirve como ejemplo del flujo de trabajo Unsloth + TRL + PEFT para adaptar Qwen3-8B, pero no hay evidencia publicada de calidad, evaluación ni datos de entrenamiento. Cualquier evaluación rigurosa debe hacerse contra el modelo base Qwen3-8B, cuyas especificaciones se heredan y se detallan a continuación con la debida cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Qwen3-8B); rango y alpha del adaptador: no disponibles |
| Parametros totales | Modelo base ~8,2B; adaptador LoRA contenido en un repo de 0,2 GB (numero exacto de parametros del adaptador: no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-8B, ampliable a 131.072 con YaRN (heredado del modelo base, no verificado en la model card) |
| Tipos de cuantizacion | El base de entrenamiento esta en bnb-4bit (NF4); el adaptador se distribuye en safetensors sin cuantizar y admite fusion con bases en fp16/bf16, 8-bit o 4-bit (GPTQ/AWQ/GGUF via conversion) |
| Idiomas soportados | No disponible en la model card (el modelo base Qwen3 declara soporte de 119 idiomas) |
| Licencia | No disponible en la model card (el modelo base Qwen3-8B se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base `unsloth/Qwen3-8B-unsloth-bnb-4bit` o equivalente |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre un transformer decoder-only denso de la familia Qwen3, en su variante de 8B parametros. El checkpoint base empleado para el ajuste es la version pre-cuantizada en 4 bits (bitsandbytes NF4) que distribuye Unsloth para reducir requisitos de memoria durante el entrenamiento. El adaptador se ha serializado en safetensors y es compatible con la libreria PEFT en su version 0.21.2, con `trl` como framework de entrenamiento y `unsloth` como capa de optimizacion.

No se dispone de informacion sobre el dataset de SFT empleado, el numero de tokens vistos, la composicion de los datos, la existencia de fases de RLHF/DPO o preferencias, ni los hiperparametros concretos (rank, alpha, dropout, learning rate, scheduler, precision mixta). La model card no documenta ninguna innovacion tecnica adicional ni variantes de atencion, decodificacion especulativa o modos de razonamiento extendido.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` sugiere un ajuste orientado a dialogo multi-turno.
- Ajuste supervisado (SFT) sobre Qwen3-8B: hereda las capacidades del base, incluidas generacion de codigo, matematicas y razonamiento, aunque el alcance real del ajuste no esta documentado.
- Soporte de tool calling / function calling: no documentado para este adaptador; el base Qwen3 incorpora plantillas de tool calling, pero no hay evidencia de que el ajuste las preserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas en la card; dependen del base Qwen3.
- Capacidades especiales (modo thinking, vision, audio): no documentadas. El base Qwen3 dispone de modos de razonamiento conmutable, pero el adaptador no declara haber sido entrenado para ello.

## Casos de uso

- Prototipado de ajuste fino con Unsloth: el adaptador sirve como referencia practica de un pipeline LoRA + TRL sobre Qwen3-8B cuantizado, util para equipos que quieran replicar el flujo con sus propios datos antes de invertir en entrenamiento a mayor escala.
- Experimentacion academica con PEFT: al ocupar solo ~0,2 GB, permite comparar configuraciones de adaptadores sobre el mismo base sin duplicar pesos, lo que facilita estudios de ablacion en un unico servidor.
- Base para ajuste en dominio especifico (continuacion del entrenamiento): puede emplearse como punto de partida para un segundo SFT sobre datos propios (legal, sanitario, soporte interno) cuando no se quiere partir del modelo base sin adaptar.
- Despliegue multi-adaptador con vLLM: al ser un adaptador PEFT, encaja en el modo multi-LoRA de vLLM, donde un unico Qwen3-8B en GPU sirve varios adaptadores especializados y se conmuta entre ellos por peticion.
- Evaluacion comparativa de calidad de ajuste: util para medir deriva (catastrophic forgetting) respecto al base Qwen3-8B con un conjunto de prompts fijo, ya que el delta de pesos es pequeno y aislable.
- Sustitucion controlada en pipelines de generacion de texto: puede integrarse en un servicio de transformers + PEFT para pruebas A/B internas frente al base, siempre que no se requiera garantia de licencia para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador solo: ~0,2 GB adicionales sobre el modelo base cargado.
- Modelo fusionado en fp16/bf16: ~16,4 GB de pesos mas cache KV; se recomienda GPU de 24 GB o superior para contextos largos.
- Modelo fusionado en 8-bit: ~8,5-9 GB de pesos.
- Modelo fusionado en 4-bit (NF4 o GPTQ/AWQ): ~5-6 GB de pesos, viable en GPUs consumer de 8-12 GB con contexto moderado.
- GPUs recomendadas: A100 40/80 GB o H100 para fp16 con lotes grandes y contexto de 32k; RTX 4090 (24 GB) y RTX 3090 (24 GB) para fp16 con lotes pequenos; RTX 4080/4070 Ti (16 GB) o RTX 3060 (12 GB) en 4-bit.
- Cabe en GPU consumer: si, en configuracion 4-bit; en fp16 requiere 24 GB como minimo.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM en modo multi-LoRA, TGI con soporte de adaptadores, llama.cpp/Ollama solo tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SaLLM-8B-LoRA_V1 (este) | Adaptador sobre ~8,2B | Heredado del base (32.768 tokens, 131.072 con YaRN) | safetensors (LoRA PEFT) | No disponible | 0 descargas, 0 likes; card sin rellenar |
| Qwen3-8B (modelo base) | ~8,2B denso | 32.768 tokens nativos, 131.072 con YaRN | safetensors, GGUF, AWQ/GPTQ | Apache 2.0 | Ampliamente distribuido y evaluado |
| unsloth/Qwen3-8B-unsloth-bnb-4bit | ~8,2B denso, 4-bit | Igual que el base | safetensors bnb-4bit | Apache 2.0 (heredada) | Checkpoint de entrenamiento, muy usado en flujos Unsloth |
| Llama 3.1 8B Instruct | ~8B denso | 128.000 tokens | safetensors, GGUF | Licencia comunitaria Llama 3.1 | Ampliamente distribuido |

No hay datos de rendimiento publicados para este adaptador que permitan una comparacion cuantitativa con las alternativas; la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Licencia no declarada: la ausencia de licencia en la model card impide asumir derechos de uso comercial, aunque el modelo base Qwen3-8B sea Apache 2.0. Es necesario contactar con el autor antes de cualquier despliegue en produccion.
- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto, lo que impide auditar sesgos o calidad.
- Sin validacion externa: 0 descargas y 0 likes; no existen报告 de terceros ni evaluaciones independientes.
- Riesgo de olvido catastrofico: al ser un SFT sobre un base cuantizado en 4 bits, el ajuste puede degradar capacidades del base (codigo, matematicas, tool calling) sin que se haya documentado una evaluacion de regresion.
- Cuantizacion del base de entrenamiento: entrenar sobre NF4 e inferir sobre fp16 puede introducir discrepancias numericas; conviene fusionar el adaptador sobre el base original en fp16 y validar.
- Idiomas no declarados: se desconoce si el ajuste conserva el soporte multilingue del base o lo ha sesgado hacia un idioma concreto.
- Riesgo de alucinacion: inherente a un modelo de 8B sin evaluacion publicada; no apto para dominios de alta criticidad sin verificacion humana.
- Ventana de contexto: aunque el base soporta 32.768 tokens, no hay evidencia de que el adaptador mantenga el rendimiento en contextos largos.
- Reproducibilidad: el autor no publica semillas, version de dataset ni script de entrenamiento, por lo que el resultado no es reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zeyad/SaLLM-8B-LoRA_V1
- Modelo base empleado en el entrenamiento: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de ML mencionada en la card: https://mlco2.github.io/impact#compute
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales especificos de este adaptador.
