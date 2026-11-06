# Youssefashoush/smollm3-3b-banking77-lora

## Resumen

`Youssefashoush/smollm3-3b-banking77-lora` es un adaptador LoRA de clasificación de intenciones construido sobre el modelo instruct `HuggingFaceTB/SmolLM3-3B`. Lo desarrolla el usuario de Hugging Face Youssefashoush y resuelve una tarea acotada: dada una consulta de un cliente bancario en inglés, devolver exactamente una de las 77 etiquetas del dataset `PolyAI/banking77`. El adaptador entrena al modelo base para emitir la etiqueta como texto generado, sin cabeza de clasificación adicional.

El modelo base SmolLM3-3B es un transformer decoder-only de 3.000 millones de parámetros de HuggingFaceTB, con modo de razonamiento ("thinking") desactivable mediante plantilla de chat. El adaptador se entrena con la opción de thinking desactivada y una plantilla con la fecha fijada al 25 de octubre de 2026 para garantizar reproducibilidad. El resultado declarado por el autor es un 92,6 % de accuracy y 92,6 % de macro-F1 sobre el split de test oficial completo (3.080 ejemplos), frente al 35,3 % del modelo base sin entrenar con el mismo prompt.

Su relevancia práctica es doble: demuestra que un ajuste LoRA ligero (≈30,2M parámetros entrenables, 0,97 % del total) sobre un modelo de 3B puede llevar una tarea de clasificación de intenciones a un rendimiento competitivo, y lo hace con un coste de entrenamiento de 162 minutos en una única Tesla T4 de 16 GB. Es un caso útil para quienes necesitan un clasificador de intenciones desplegable en hardware modesto y con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (SmolLM3-3B) |
| Parámetros totales | ≈3.000M en el modelo base; adaptador LoRA de ≈30,2M (0,97 %) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el entrenamiento usó max length 1024 |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de SmolLM3-3B) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM3-3B, un transformer decoder-only de 3B parámetros. El ajuste es un LoRA con r=16, alpha=32, dropout=0,05 y módulos objetivo en todas las capas lineales (`down_proj`, `gate_proj`, `k_proj`, `o_proj`, `q_proj`, `up_proj`, `v_proj`). El entrenamiento usa `SFTTrainer` de TRL en formato conversacional prompt-completion, con la pérdida calculada únicamente sobre los tokens de la etiqueta y el token de cierre `<|im_end|>`; el system prompt y el mensaje de usuario quedan enmascarados. Se usa el modo thinking desactivado (`enable_thinking=False`) y una plantilla de chat con la fecha fijada a "25 October 2026" para reproducibilidad.

Los datos son el split de entrenamiento oficial de Banking77 (10.003 ejemplos), dividido 90/10 de forma estratificada con semilla 42: 9.002 para entrenamiento y 1.001 para validación. Se realiza una sola época. La optimización usa lr 2e-4, scheduler coseno, warmup de ~3 % (17 pasos), batch 4 con acumulación de gradiente 4 (efectivo 16), 563 pasos, precisión mixta fp16, gradient checkpointing y longitud máxima 1024. El entrenamiento se ejecutó en 1× NVIDIA Tesla T4 (16 GB, Google Colab) durante 162 minutos. La pérdida de validación evolucionó de 0,197 (paso 100) a 0,059 (paso 563). Versiones: transformers 5.20.2, peft 0.21.2, trl 1.16.0, torch 2.11.0+cu130, datasets 5.1.0.

## Capacidades

- Clasificación de intenciones bancarias en inglés: devuelve exactamente una de las 77 etiquetas de Banking77.
- Generación de texto restringida a la etiqueta: el adaptador está entrenado para emitir solo el string de la etiqueta, sin texto adicional (0 % de salidas inválidas en el test oficial).
- Razonamiento y generación general heredados del base SmolLM3-3B, aunque el adaptador está especializado y no se ha evaluado en esas tareas.
- No se documenta soporte de tool calling ni function calling específico para el adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso en el adaptador.
- Capacidades multilingües: solo inglés declarado.
- Requiere el system prompt exacto de entrenamiento (instrucción + lista de 77 etiquetas) y la plantilla de chat del repositorio del adaptador; usar otro prompt degrada la precisión.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo lee el mensaje del cliente y devuelve la intención, que se usa para asignar el ticket al equipo o flujo correspondiente. Adecuado por su 92,6 % de accuracy en el test oficial y su 0 % de salidas inválidas, lo que simplifica el parseo en producción.
- Clasificación en un chatbot de atención al cliente: integrado como primer paso de un pipeline, identifica la intención antes de invocar la respuesta o el agente adecuado. El bajo coste computacional del adaptador permite ejecutarlo en cada turno.
- Etiquetado y triaje de correos o formularios de banca: procesa mensajes entrantes en lote para preclasificarlos antes de la revisión humana, reduciendo el trabajo manual en colas de soporte.
- Análisis de motivos de contacto: agregar las intenciones predichas sobre un volumen de consultas permite medir qué problemas (transferencias pendientes, límites de tarjeta, etc.) generan más contactos.
- Despliegue en hardware modesto: al ser un LoRA sobre un modelo de 3B, puede servirse en una GPU consumer o incluso en CPU con cuantización del base, lo que lo hace apto para entornos con presupuesto limitado.
- Base para adaptaciones a otros dominios: la receta (LoRA r=16 sobre SmolLM3-3B con SFT en formato prompt-completion) es reutilizable para clasificación de intenciones en otros sectores sustituyendo el dataset y la lista de etiquetas.
- Filtrado previo en sistemas de moderación o compliance: clasificar la intención de un mensaje para decidir si requiere revisión regulatoria o si puede responderse automáticamente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el split de test oficial de Banking77 (3.080 ejemplos), decodificación greedy, con el mismo prompt en todos los casos:

| Modelo / configuración | Accuracy | Macro-F1 | Salidas inválidas |
|---|---|---|---|
| SmolLM3-3B base, sin entrenar | 35,3 % | 33,9 % | 5,8 % |
| Adaptador, pilot (1.001 ejemplos) | no disponible en test completo | no disponible en test completo | no disponible en test completo |
| Adaptador, final (9.002 ejemplos) | 92,6 % | 92,6 % | 0,0 % |

Resultados adicionales del autor en otros conjuntos:

| Conjunto de evaluación | Baseline (sin entrenar) | Pilot | Final |
|---|---|---|---|
| Quick eval (770, 10/etiqueta del test) | 34,5 % / 33,7 % / 6,6 % | 79,0 % / 78,8 % / 0,3 % | 93,2 % / 93,1 % / 0,0 % |
| Validación (1.001, reservado del train) | 33,0 % / 32,4 % / 5,1 % | 75,7 % / 75,9 % / 0,0 % | 89,3 % / 88,9 % / 0,0 % |
| Test oficial completo (3.080) | 35,3 % / 33,9 % / 5,8 % | — | 92,6 % / 92,6 % / 0,0 % |

Etiquetas más débiles del modelo final (F1 / recall / F1 del baseline / predicción errónea más frecuente): `topping_up_by_card` (0,72 / 0,68 / 0,00 / `top_up_reverted`), `pending_transfer` (0,76 / 0,70 / 0,12 / `transfer_timing`), `balance_not_updated_after_bank_transfer` (0,76 / 0,72 / 0,38 / `transfer_timing`), `transfer_not_received_by_recipient` (0,77 / 0,70 / 0,13 / `pending_card_payment`), `fiat_currency_support` (0,81 / 0,82 / 0,09 / `exchange_via_app`), `declined_transfer` (0,82 / 0,70 / 0,00 / `declined_card_payment`), `card_delivery_estimate` (0,85 / 0,78 / 0,28 / `card_arrival`), `transfer_timing` (0,85 / 0,95 / 0,38 / `pending_transfer`). Los errores restantes se concentran entre intenciones casi sinónimas. Ninguna etiqueta quedó por debajo del baseline.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade ≈30,2M parámetros (≈60 MB en fp16) sobre el modelo base. El base SmolLM3-3B en bf16 requiere aproximadamente 6 GB de VRAM; en cuantización de 8 bits, alrededor de 3 GB; en 4 bits, alrededor de 2 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 1× Tesla T4 (16 GB) en 162 minutos. Para inferencia, una RTX 3090/4090 (24 GB) o una A100/H100 ofrecen margen amplio; una T4 o RTX 3060 de 12 GB son suficientes en bf16.
- Cabe en GPU consumer: sí, el base de 3B en bf16 cabe en GPUs de 8-12 GB; con cuantización de 4 bits cabe en GPUs de 4-6 GB.
- Opciones de despliegue: el adaptador se carga con `peft` sobre `transformers`. Para servicio de alto rendimiento puede fusionarse con el base y servirse con vLLM o TGI; para CPU o entornos ligeros, convertir el base fusionado a GGUF y usar llama.cpp u Ollama. No se documentan configuraciones específicas de despliegue en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se han publicado comparaciones con otros adaptadores o clasificadores en la información disponible. Como referencia, el propio autor compara contra el modelo base sin entrenar:

| Modelo | Parámetros | Contexto | Accuracy en Banking77 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B + este LoRA | ≈3.000M base + 30,2M adaptador | no disponible | 92,6 % | Apache 2.0 | Hugging Face |
| SmolLM3-3B base (sin entrenar) | ≈3.000M | no disponible | 35,3 % | Apache 2.0 | Hugging Face |

No se dispone de datos de otros clasificadores de intenciones comparables en la información proporcionada.

## Limitaciones y advertencias

- Sensibilidad al prompt: la precisión depende de usar exactamente el system prompt de entrenamiento (instrucción + lista de 77 etiquetas), el mensaje de usuario con el texto del cliente y la plantilla de chat del repositorio del adaptador. Cualquier cambio en el system prompt, la lista de etiquetas o la plantilla reduce la precisión.
- Fecha fijada en la plantilla: la plantilla de chat del repositorio fija la fecha a "25 October 2026"; debe cargarse el tokenizer desde el repositorio del adaptador, no desde el modelo base, para reproducir el comportamiento de entrenamiento.
- Modo thinking desactivado: el adaptador se entrenó con `enable_thinking=False`; activar el razonamiento puede alterar las salidas.
- Idioma: solo inglés declarado; no se ha evaluado en otros idiomas.
- Dominio acotado: las 77 etiquetas son específicas de banca; el modelo no está pensado para clasificación fuera de ese conjunto y puede forzar una etiqueta aunque el mensaje no encaje.
- Errores entre intenciones casi sinónimas: las confusiones se concentran en pares como `pending_transfer` / `transfer_timing` o `declined_transfer` / `declined_card_payment`, con F1 por debajo de 0,85 en varias etiquetas.
- Riesgo de alucinación: aunque el adaptador emite solo etiquetas en el 100 % de los casos del test, no hay garantía formal de que en producción no genere texto fuera de la lista; conviene validar la salida contra el conjunto de 77 etiquetas.
- Benchmarks no verificados: los resultados del model-index están marcados como `verified: false`; proceden del autor y no han sido replicados de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse la atribución y revisarse las condiciones del modelo base SmolLM3-3B.
- Volumen de uso bajo: 20 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- System prompt de entrenamiento: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora/blob/main/system_prompt.txt
- Ejemplo de prompt renderizado: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora/blob/main/rendered_prompt_example.txt
- Plantilla de chat del adaptador: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora/blob/main/chat_template.jinja
- Curva de pérdida: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora/blob/main/loss_curve.png
- Comparativa de resultados: https://huggingface.co/Youssefashoush/smollm3-3b-banking77-lora/blob/main/final_comparison.png
