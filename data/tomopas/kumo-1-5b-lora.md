# Tomopas/Kumo-1.5B-LoRA

## Resumen

Kumo-1.5B-LoRA es un adaptador LoRA publicado por el usuario Tomopas en Hugging Face, entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL sobre un modelo base identificado únicamente como `weights/base`. El repositorio contiene únicamente los pesos del adaptador (0,5 GB), no el modelo completo, por lo que su uso requiere disponer por separado del modelo base referenciado. La nomenclatura del identificador sugiere un modelo de aproximadamente 1.500 millones de parámetros, aunque esta cifra no se confirma en la model card.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación técnica: no se publican datos sobre el dataset de entrenamiento, la composición de los datos, el número de tokens vistos ni resultados de benchmarks. La model card es la plantilla autogenerada por TRL, con campos sin rellenar (el modelo base aparece como `None` en la sección de inicio rápido y en la frase de fine-tuning). Esto implica que cualquier evaluación rigurosa del adaptador debe realizarse empíricamente por parte del usuario.

Se trata, por tanto, de un artefacto de investigación o experimento personal, no de un modelo listo para producción. Su interés radica en servir como ejemplo de flujo de trabajo SFT con PEFT/TRL sobre un modelo pequeño, y en la posibilidad de inspeccionar los pesos del adaptador para estudiar qué tipo de ajuste se ha aplicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (adaptador LoRA sobre modelo base no especificado) |
| Parametros totales | no disponible (el identificador sugiere ~1.5B en el modelo base; el adaptador ocupa 0.5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica `licence: license`, sin concretar) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) entrenado con PEFT 0.21.0 y TRL 1.14.2 sobre Transformers 4.57.6 y PyTorch 2.14.1+cu126. La model card confirma que el entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) y que el nombre interno del experimento es `sft_clean`, lo que sugiere un proceso de limpieza previo del dataset, aunque no se detalla en qué consistió. No se especifica el rango del adaptador, los módulos objetivo ni el valor de alpha.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de etapas de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El pipeline declarado es `text-generation` con etiqueta `conversational`, lo que indica que el ajuste se orientó a formato de diálogo, pero no se aportan ejemplos de conversaciones ni plantilla de chat. El modelo base (`weights/base`) no está identificado con un repositorio público verificable.

## Capacidades

- Generación de texto condicionada al modelo base subyacente, que no se especifica.
- Ajuste orientado a formato conversacional (etiqueta `conversational` y pipeline `text-generation`), según la metadata del repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales (modo thinking, visión, audio).
- Cualquier capacidad adicional depende enteramente del modelo base, del que no se ofrece información.

## Casos de uso

- Investigación de flujos SFT con TRL: el adaptador sirve como referencia para reproducir un pipeline de fine-tuning con PEFT 0.21.0 y TRL 1.14.2, inspeccionando los hiperparámetros efectivos a partir de los pesos.
- Estudio de adaptadores LoRA de bajo rango: permite analizar la distribución de pesos del adaptador y comparar con otras variantes del mismo modelo base.
- Prototipado conversacional en local: si se dispone del modelo base, puede combinarse con el adaptador para experimentar con respuestas en formato diálogo en entornos de desarrollo.
- Evaluación comparativa de técnicas de limpieza de datos: el nombre `sft_clean` sugiere un experimento sobre filtrado de dataset, útil para reproducir y contrastar resultados.
- Docencia y formación: ejemplo práctico de cómo se publica un adaptador PEFT y qué metadatos debe incluir una model card completa (y cuáles faltan aquí).
- Base para experimentos de merging: el adaptador puede fusionarse con el modelo base para estudiar el efecto del ajuste en tareas concretas, siempre que se identifique dicho base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que depende del modelo base. Para un transformer de ~1.5B en fp16 se requieren aproximadamente 3 GB de VRAM solo para pesos, más overhead de activaciones y caché KV; en cuantización de 4 bits, en torno a 1-1.5 GB.
- GPU recomendadas: no disponibles. Para un modelo de ~1.5B, una RTX 3060 de 12 GB o superior sería suficiente en fp16; una RTX 4090 permitiría mayor throughput y contextos más largos.
- Cabe en GPU de consumo: probablemente sí para modelos de ~1.5B, pero no confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con Transformers y aplicar el adaptador; también podría fusionarse y convertirse a GGUF para llama.cpp u Ollama, pero no se proporcionan instrucciones ni conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque el modelo base no está identificado y no se publican métricas. Cualquier comparación sería especulativa.

## Limitaciones y advertencias

- Model card incompleta: el campo `base_model` apunta a `weights/base`, una ruta local no publicada, y la sección de inicio rápido usa `None` como identificador, por lo que el adaptador no es utilizable tal cual sin conocer el modelo base exacto.
- Licencia no especificada: la model card indica `licence: license` sin concretar términos; no se puede garantizar uso comercial.
- Sin información sobre el dataset de entrenamiento: se desconoce la procedencia de los datos, posibles sesgos y calidad del ajuste.
- Riesgo de alucinación: inherente a los modelos generativos; no hay evaluación que lo cuantifique.
- Idiomas y contexto: no documentados; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Sin benchmarks: imposible validar el rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes: sin evidencia de uso comunitario ni validación externa.
- Fecha de creación futura (2026-11-04) en los metadatos: inconsistencia que sugiere datos de publicación anómalos o de relleno.

## Enlaces

- Hugging Face: https://huggingface.co/Tomopas/Kumo-1.5B-LoRA
- Repositorio TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Repositorio PEFT: https://github.com/huggingface/peft
