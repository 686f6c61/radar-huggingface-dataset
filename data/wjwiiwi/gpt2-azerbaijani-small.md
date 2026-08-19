# Wjwiiwi/gpt2-azerbaijani-small

## Resumen

El modelo `Wjwiiwi/gpt2-azerbaijani-small` es una adaptación del modelo GPT-2 small (124 millones de parámetros) al idioma azerí, entrenado mediante transferencia de aprendizaje y fine-tuning sobre el corpus de Wikipedia en azerí. El trabajo original fue realizado por Nijat Zeynalov y publicado como `nijatzeynalov/gpt2-azerbaijani-small`; este repositorio es una copia subida por el usuario Wjwiiwi, con el mismo contenido y licencia.

El modelo fue entrenado durante aproximadamente 29 horas en una única GPU NVIDIA Tesla K80, con 3 épocas y un dataset de 110 000 artículos de entrenamiento y 19 000 de validación. Los resultados reportados son una pérdida de 5.17, una precisión del 23.99 % y una perplejidad de 95.88, lo que indica una calidad de generación limitada. El propio autor advierte que el modelo no es apto para uso comercial y que fue desarrollado con fines de investigación.

A pesar de sus limitaciones, este modelo es relevante como uno de los pocos intentos de adaptar GPT-2 a una lengua de bajos recursos como el azerí, y puede servir como punto de partida para experimentos de fine-tuning o para estudiar el comportamiento de modelos generativos en idiomas poco representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (Transformer decoder, 12 capas, 12 cabezas de atención, 768 dimensiones ocultas) |
| Parametros totales | 124 M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (según el código de uso: `tokenizer.model_max_length=1024`) |
| Tipos de cuantizacion | No disponible (solo pesos completos en PyTorch) |
| Idiomas soportados | Azerí (entrenado exclusivamente en Wikipedia en azerí) |
| Licencia | OpenRAIL (openrail) |
| Formato de pesos | Checkpoint PyTorch (`.pth`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 small de OpenAI: un transformer decoder con 12 capas, 12 cabezas de atención y una dimensión de embedding de 768. No presenta innovaciones arquitectónicas adicionales; es una adaptación directa del modelo preentrenado en inglés mediante fine-tuning sobre texto en azerí.

El entrenamiento se realizó sobre la Wikipedia en azerí, con 110 000 artículos para entrenamiento y 19 000 para validación. Se utilizó transfer learning desde el GPT-2 original y fine-tuning con una política de ciclo único (1cycle policy). El entrenamiento duró 29 horas en una NVIDIA Tesla K80, con 3 épocas. No se menciona el uso de técnicas como RLHF o DPO. El dataset no fue limpiado en profundidad, según admite el autor, lo que afecta a la calidad final.

## Capacidades

- Generación de texto en azerí: el modelo es capaz de producir texto coherente en azerí, aunque con limitaciones evidentes de calidad y coherencia a largo plazo.
- Modelado de lenguaje: puede calcular la probabilidad de secuencias de texto, útil para tareas de evaluación o clasificación.
- No soporta tool calling ni function calling, al ser un GPT-2 básico sin entrenamiento específico.
- No tiene capacidades de agente ni razonamiento multi-paso.
- Multilingüismo: solo azerí; no se ha evaluado su comportamiento en otros idiomas.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación académica sobre modelos generativos en lenguas de bajos recursos: el modelo sirve como referencia para estudiar el comportamiento de GPT-2 en azerí y comparar con futuros modelos.
- Fine-tuning para tareas específicas en azerí: se puede partir de este checkpoint para adaptarlo a dominios concretos (noticias, literatura, etc.) con datasets adicionales.
- Evaluación de técnicas de adaptación lingüística: permite probar métodos de transferencia, regularización o aumento de datos en un contexto de recursos limitados.
- Generación de texto para prototipos educativos: útil en entornos de aprendizaje donde se necesite un generador de texto azerí básico, sin requisitos de producción.
- Análisis de sesgos y limitaciones: al estar entrenado sobre Wikipedia, puede emplearse para estudiar sesgos presentes en el corpus y su impacto en la generación.
- Pruebas de infraestructura: sirve como modelo ligero para validar pipelines de inferencia con transformers en azerí, aunque no se recomienda para servicios reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la perplejidad de 95.88 sobre el conjunto de validación, junto con una precisión del 23.99 % y una pérdida de 5.17. No hay comparaciones con otros modelos en azerí.

## Requisitos de hardware

- VRAM estimada: al tener 124 M de parámetros, la inferencia en FP32 requiere aproximadamente 0.5 GB de VRAM. Con cuantización a 8 bits (si se aplicara) se reduciría a unos 0.25 GB, pero no se proporcionan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una NVIDIA T4, GTX 1650 o incluso CPU son viables para inferencia.
- En consumer GPU: sí, cabe en cualquier GPU moderna, incluso en iGPU.
- Opciones de despliegue: se puede usar con Hugging Face Transformers (PyTorch) directamente. No hay soporte nativo para vLLM, llama.cpp u Ollama, pero podría convertirse a otros formatos.
- Latencia: para un modelo de 124 M, la generación de 100 tokens tarda del orden de 1-2 segundos en una GPU modesta y 5-10 segundos en CPU, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wjwiiwi/gpt2-azerbaijani-small | 124 M | 1024 | Wikipedia azerí, 3 épocas | OpenRAIL | Hugging Face |
| nijatzeynalov/gpt2-azerbaijani-small | 124 M | 1024 | Wikipedia azerí, 3 épocas | OpenRAIL | Hugging Face (original) |
| allmalab/gpt2-aze | 124 M (presumible) | no disponible | Texto azerí (no especificado) | no disponible | Hugging Face |

No hay datos de rendimiento comparativo entre estos modelos. El proyecto AzGPT (GitHub) busca adaptar modelos más grandes como Qwen o Llama al azerí, pero no está publicado como modelo listo.

## Limitaciones y advertencias

- Calidad de generación muy baja: el autor indica explícitamente que los resultados son de baja calidad debido a recursos limitados y que no se recomienda su uso en proyectos comerciales.
- Sesgos del corpus: entrenado sobre Wikipedia en azerí, que contiene contenido no filtrado de internet y puede reflejar sesgos de género, raza o religión, como se señala en la model card original.
- Riesgo de alucinación: como todos los modelos GPT-2, no distingue entre hechos y ficción; no debe usarse para generar información factual.
- Limitaciones de idioma: solo azerí, y con un vocabulario limitado al corpus de Wikipedia.
- Licencia OpenRAIL: permite uso comercial, pero con restricciones de uso responsable (no generar contenido dañino). Aun así, el autor desaconseja su uso en producción.
- Formato de pesos: el checkpoint está en formato PyTorch `.pth`, no en safetensors, lo que puede dificultar su integración en algunos entornos.
- Sin mantenimiento: el repositorio no ha sido actualizado desde su creación (agosto de 2026) y no hay soporte activo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wjwiiwi/gpt2-azerbaijani-small
- Modelo original (autor): https://huggingface.co/nijatzeynalov/gpt2-azerbaijani-small
- Modelo alternativo en azerí: https://huggingface.co/allmalab/gpt2-aze
- Proyecto AzGPT (continual pretraining para azerí): https://github.com/MahammadNuriyev62/azgpt
- Artículo sobre modelos abiertos para azerí: https://arxiv.org/html/2407.02337v1
