# Vusal96-creator/novashop-support-lora

## Resumen

NovaShop Support LoRA es un adaptador PEFT (LoRA) entrenado mediante SFT sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Meta Llama 3.1 8B Instruct preparada por Unsloth. El adaptador lo publica el usuario Vusal96-creator en Hugging Face y su nombre sugiere un ajuste orientado a atención al cliente para una tienda llamada NovaShop, aunque la model card no documenta el dataset, el procedimiento ni los objetivos de entrenamiento.

El repositorio contiene únicamente los pesos del adaptador (0,2 GB en formato safetensors), no el modelo completo. Para utilizarlo es necesario cargar el modelo base de Unsloth y aplicar el adaptador mediante la librería PEFT. Al heredar la arquitectura de Llama 3.1 8B Instruct, el modelo resultante conserva la ventana de contexto de 128 000 tokens del original, aunque el adaptador no aporta capacidades nuevas más allá del dominio para el que fue ajustado.

La relevancia de esta ficha es limitada: se trata de un artefacto de fine-tuning de bajo perfil, sin métricas publicadas, sin licencia declarada y sin documentación técnica. Resulta útil como ejemplo de flujo de trabajo Unsloth + PEFT + TRL para ajuste de instrucciones, pero no debe considerarse un modelo listo para producción sin una evaluación previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8 030 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B Instruct soporta 128 000 tokens |
| Tipos de cuantizacion | el modelo base referenciado está en bnb-4bit; el adaptador se distribuye en safetensors (precisión no especificada) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Meta Llama 3.1 8B Instruct, un transformer decoder-only con 8 030 millones de parámetros, atención con RoPE, GQA y ventana de contexto de 128 000 tokens. La versión base utilizada es la publicada por Unsloth en cuantización bnb-4bit, pensada para reducir el consumo de VRAM durante el ajuste fino. El adaptador en sí es un conjunto de matrices de bajo rango (LoRA) que modifica las proyecciones del modelo base; su rango, alpha y módulos objetivo no se especifican en la model card.

El entrenamiento se realizó con SFT (supervised fine-tuning) usando la pila TRL + PEFT + Unsloth, según las etiquetas del repositorio y la versión de PEFT 0.21.2 declarada. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, hiperparámetros de entrenamiento (learning rate, batch size, epochs) ni la infraestructura utilizada. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como `[More Information Needed]`, por lo que no hay información verificable sobre el proceso.

## Capacidades

- Generación de texto conversacional en el dominio de atención al cliente, asumiendo que el ajuste se realizó sobre diálogos de soporte de una tienda (no confirmado en la model card).
- Razonamiento e instrucciones generales heredados del modelo base Llama 3.1 8B Instruct.
- Generación de código y matemáticas básicas heredadas del modelo base; el adaptador no está orientado a estas tareas.
- Soporte de tool calling / function calling heredado del formato de Llama 3.1 Instruct, aunque no se ha verificado que el adaptador lo preserve.
- Capacidades multilingües heredadas del modelo base (oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), sin datos específicos del adaptador.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Prototipado de asistentes de atención al cliente: el adaptador puede desplegarse sobre Llama 3.1 8B para generar respuestas en un dominio de tienda online, siempre que se valide la calidad con un conjunto de evaluación propio antes de exponerlo a usuarios.
- Base para un pipeline de ajuste continuo: sirve como punto de partida para iterar con nuevos datos de soporte usando Unsloth + TRL, ya que el adaptador es pequeño (0,2 GB) y se puede reentrenar con recursos modestos.
- Experimentación académica sobre LoRA y SFT: útil para comparar configuraciones de rango, alpha y datasets en un caso de dominio concreto.
- Despliegue en entornos con VRAM limitada: al combinarse con el modelo base en 4 bits, el conjunto puede ejecutarse en GPUs de consumo (ver sección de hardware), lo que facilita demos internas.
- Generación de respuestas FAQ: si el ajuste se confirma orientado a soporte, puede emplearse para redactar respuestas a preguntas frecuentes de una tienda, con revisión humana obligatoria.
- Evaluación de riesgos de adaptadores de terceros: caso de uso meta para equipos de seguridad que quieran analizar cómo se comporta un LoRA no documentado sobre un modelo base conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del conjunto (modelo base 4-bit + adaptador): en torno a 6-8 GB para el modelo base en bnb-4bit, más overhead de activaciones y KV cache; con contexto largo (128k) el consumo de KV cache crece de forma significativa.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para uso local cómodo; A100 40/80 GB o H100 para despliegue con contexto largo y concurrencia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) y potencialmente en GPUs de 12-16 GB con cuantización GGUF del modelo base fusionado con el adaptador.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (requiere fusionar el adaptador en el modelo base), llama.cpp/Ollama (requiere exportar a GGUF tras fusionar), TGI (con versión compatible con Llama 3.1).
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NovaShop Support LoRA (este) | adaptador sobre 8B | 128k (heredado) | LoRA SFT | no disponible | Hugging Face, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral 7B Instruct | 7B | 32k | Modelo completo | Apache 2.0 | Hugging Face |
| Qwen2.5 7B Instruct | 7B | 128k | Modelo completo | Apache 2.0 (mayoría de variantes) | Hugging Face |

La comparación es estructural: el adaptador no publica métricas, por lo que no es posible contrastar rendimiento. Frente a los modelos completos, la ventaja del adaptador es su tamaño reducido y su especialización potencial; la desventaja es la ausencia de documentación, licencia y evaluación.

## Limitaciones y advertencias

- La model card es la plantilla por defecto: no hay información sobre dataset, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial; además, el modelo base Llama 3.1 tiene su propia licencia comunitaria que impone restricciones adicionales.
- Riesgo de alucinación heredado del modelo base, agravado por la falta de evaluación del adaptador en el dominio objetivo.
- Sesgos potenciales del modelo base (Llama 3.1) y del dataset de ajuste, que se desconoce; no se puede auditar su composición.
- Idiomas soportados no confirmados para el adaptador; el ajuste podría haber degradado el multilingüismo del modelo base.
- Sin métricas de benchmarks ni evaluaciones de seguridad publicadas.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad.
- El adaptador requiere cargar el modelo base de Unsloth en bnb-4bit; la fusión y exportación a otros formatos (GGUF, vLLM) no está documentada y puede requerir trabajo adicional.
- No apto para producción sin una evaluación propia exhaustiva, revisión de licencia y auditoría de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Vusal96-creator/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original Meta Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
