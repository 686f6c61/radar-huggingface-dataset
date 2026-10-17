# thealper2/qwen3.5-0.8b-slake-medvqa-lora

## Resumen
Este repositorio contiene un adaptador LoRA, no un modelo completo, sobre Qwen/Qwen3.5-0.8B, desarrollado por thealper2 para respuesta visual a preguntas médicas (medical VQA) en inglés y chino sobre SLAKE. El modelo base tiene 855.443.520 parámetros, una torre ViT de 12 bloques (patch 16, fusión 2x2) y un LM híbrido de 24 capas: 18 Gated DeltaNet y 6 de atención completa con compuertas. El adaptador entrena 2.457.600 parámetros (0,2873 %) y se distribuye en safetensors con PEFT.

Resuelve la adaptación barata de un multimodal pequeño a un dominio clínico con pocos datos: SLAKE aporta 8.542 pares pregunta-respuesta de entrenamiento sobre 391 imágenes. En test (2.094 pares, 180 imágenes) declara 77,22 % de exactitud y 84,06 % de token F1, con 83,01 % en preguntas cerradas y 73,37 % en abiertas; la partición es image-disjoint para evitar fuga de imágenes.

Es relevante para investigación de bajo coste y prototipos en GPU de consumo, porque solo ajusta 2,46 M de parámetros sobre 855 M. El autor lo marca como prototipo de investigación no validado para uso clínico. La licencia del adaptador es Apache-2.0; la del modelo base no se indica.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Tipo | Adaptador LoRA para VQA médica; no es un modelo completo |
| Modelo base | Qwen/Qwen3.5-0.8B (commit 2fc06364715b967f1860aea9cf38778875588b17) |
| Arquitectura | Multimodal híbrida: ViT de 12 bloques (patch 16, fusión 2x2) + LM de 24 capas (18 Gated DeltaNet + 6 de atención completa con compuertas) |
| Parámetros totales | 855.443.520 en el modelo base; 2.457.600 entrenables en el adaptador (0,2873 %) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; entrenamiento en bf16 y sin versiones GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (adaptador); licencia del modelo base no indicada |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se carga en safetensors |
| Datos de entrenamiento | BoKelvin/SLAKE (commit a9083ce6c34ac3ffb17671a605962924d8a8f9e9) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento
El modelo base combina una torre visual ViT de 12 bloques, patch de 16 píxeles y fusión 2x2, con un LM de 24 capas. Dieciocho capas usan Gated DeltaNet y seis usan atención completa con compuertas; el adaptador LoRA se aplica solo al LM, no a la torre visual. Los módulos objetivo son `self_attn.{q,k,v,o}_proj` en las 6 capas de atención completa y `linear_attn.{in_proj_qkv,in_proj_z,out_proj}` en las 18 capas Gated DeltaNet. El rango es r=8, alpha=16 y dropout=0,05. Permanecen congelados la torre visual, el merger, los MLP, los embeddings y el lm_head.

El entrenamiento usa SLAKE en ambos idiomas, sin traducción, con partición image-disjoint: test oficial intacto y train/validación reconstruidos tras eliminar 1.828 registros con imagen compartida con test, 14 duplicados y 1 respuesta vacía. Quedan 8.542 pares/391 imágenes en train, 1.549/71 en validación y 2.094/180 en test. La pérdida es causal LM solo sobre la respuesta (prompt e imagen enmascarados), con batch 1 y acumulación 8, AdamW, lr 0,0001, weight decay 0,01, cosine, warmup 0,03, grad clip 1,0, máximo 3 épocas y early stopping con paciencia 4 evaluaciones. Se usa bf16, gradient checkpointing, presupuesto visual de 65.536-262.144 px (<=256 tokens visuales), semilla 42 y 1.500 pasos de optimizador. El mejor checkpoint es checkpoint-1000, con eval_gen_exact_match=0,78 en validación. El entrenamiento duró 91,7 minutos en una RTX 5060 Ti de 15,9 GB con torch 2.11.0+cu128, transformers 5.19.0, peft 0.18.1 y CUDA 12.8. No se documenta RLHF, DPO ni otra fase de alineación.

## Capacidades
- Respuesta visual a preguntas médicas sobre imágenes de SLAKE, en formato image-text-to-text.
- Preguntas cerradas (sí/no, opción múltiple) y abiertas; en test, 83,01 % en cerradas y 73,37 % en abiertas.
- Respuestas cortas: la evaluación usa greedy decoding y un máximo de 32 tokens nuevos.
- Bilingüe inglés-chino, con 78,8 % en inglés y 75,6 % en chino en test.
- Integración con la plantilla de chat de Qwen y `enable_thinking=False`; no se entrena un modo de razonamiento largo.
- No se documenta tool calling, function calling, agentes ni razonamiento multi-paso; el ajuste es solo de VQA.
- No hay soporte de audio o vídeo; la entrada es imagen + texto.
- El adaptador no está pensado para generación de informes largos ni para diálogo general; el modelo base conserva sus capacidades, pero no se validan aquí.

## Casos de uso
- Investigación en VQA médica: servir como baseline reproducible y barato para comparar adaptadores LoRA sobre Qwen3.5-0.8B; su exactitud de 77,22 % y F1 de 84,06 % en SLAKE permiten medir mejoras con el mismo protocolo.
- Anotación asistida de datasets: prellenar respuestas de VQA sobre imágenes médicas para que un experto las revise; en test declara 0 % de respuestas vacías y 0 % de salidas inválidas, lo que reduce el trabajo de limpieza.
- Educación médica y entrenamiento: construir cuestionarios interactivos sobre imágenes en inglés o chino, con respuestas cortas y supervisión docente; adecuado por su bajo coste y su soporte bilingüe.
- Prototipos en GPU de consumo: desplegar una demo de VQA médica en una RTX 4060 de 8 GB o similar, ya que el modelo base tiene 855 M de parámetros y el adaptador solo 2,46 M.
- Evaluación de robustez y sesgos: usar la ablación de imagen del autor (77,2 % con imagen correcta, 30,8 % sin imagen, 39,6 % con imagen barajada) para estudiar cuánto depende el modelo del contexto visual frente a priors lingüísticos.
- Búsqueda multimodal en investigación clínica: dada una
