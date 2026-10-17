# xvanov/rentus-reader-qwen3-0.6b

## Resumen

rentus-reader-qwen3-0.6b es un ajuste fino completo de Qwen3-0.6B (596.049.920 parámetros) creado por xvanov para extraer información estructurada de conversaciones de alquiler de habitaciones. Dado el hilo previo y el último mensaje del inquilino, devuelve un único objeto JSON con los campos lease, move_in, phone, occupants, reason, intents y language, y clasifica cada campo como answered, vague, no, exception o absent. Es la herramienta read_reply de Rentus Operator, presentada en el hackathon NVIDIA x Red Hat Small Models Hack (Raleigh, 17-18 de octubre de 2026), y sirve para que un operador de 30B-A3B delegue la lectura del mensaje en un modelo pequeño.

El interés está en el patrón: un modelo de 0,6B con salida JSON validable, temperatura 0 y bajo coste de despliegue actúa como extractor especializado dentro de un agente. El checkpoint es bf16 safetensors, sin adaptador, licencia CC BY-SA 4.0, idiomas inglés y español, y en el ejemplo de servicio se configura con 4096 tokens de contexto. No hay una innovación arquitectónica declarada; el valor está en el ajuste de la tarea y en el esquema de estados, no en el tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; modelo base Qwen3-0.6B, transformer decoder-only denso |
| Parámetros totales | 596.049.920 |
| Parámetros activos | No aplica; modelo denso, no MoE |
| Longitud de contexto | 4096 tokens en la configuración de servicio indicada con vLLM (`--max-model-len 4096`); longitud nativa del modelo base no disponible en la información proporcionada |
| Tipos de cuantización | bf16 safetensors; no se mencionan GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | en, es |
| Licencia | CC BY-SA 4.0; el modelo base Qwen3-0.6B es Apache-2.0 |
| Formato de pesos | safetensors (bf16), checkpoint estándar de Hugging Face sin adaptador |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de todos los parámetros de Qwen/Qwen3-0.6B, un transformer decoder-only denso. No se usa un adaptador LoRA: el repositorio contiene un checkpoint estándar de Hugging Face en bf16 safetensors. El entrenamiento se hizo con TRL `SFTTrainer` en formato prompt-completion, con la pérdida calculada únicamente sobre el JSON de salida, 876 pasos de optimizador (máximo 2 épocas), batch efectivo 32, lr 3e-05, evaluación de la pérdida en 400 filas de dev cada 100 pasos y early stopping. El run completo duró 33,2 minutos en una NVIDIA RTX PRO 6000 Blackwell Server Edition. La model card no menciona RLHF ni DPO; el ajuste documentado es SFT.

Los datos son 14.000 filas de entrenamiento, 1.100 de dev y 1.419 de test reservado. 12.000 filas son sintéticas bilingües generadas con plantillas escritas a mano en inglés y español y estilos de persona (casual, formal, telegráfico, emoji, mayúsculas); según el autor, ningún LLM generó texto ni etiquetas, y el proceso es reproducible con semilla 7. Las otras 2.000 filas son turnos USER de Google Schema-Guided Dialogue (DSTC8), diálogos `Homes_1`/`Homes_2`, reetiquetados a este esquema mediante reglas sobre actos de diálogo. El test se mantiene reservado con plantillas y conjuntos de nombres, empleadores, ciudades y prefijos solo de test, diálogos de test de SGD y eliminación de duplicados exactos. No se usaron datos reales de inquilinos. Los casos duros declarados son fechas vagas, fechas de visita
