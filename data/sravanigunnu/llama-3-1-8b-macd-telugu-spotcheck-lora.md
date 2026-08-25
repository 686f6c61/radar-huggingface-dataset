# Sravanigunnu/llama-3.1-8b-macd-telugu-spotcheck-lora

## Resumen

El modelo `Sravanigunnu/llama-3.1-8b-macd-telugu-spotcheck-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Sravani Gunnu, diseñado para la detección de discurso de odio en telugu. Se basa en el modelo `meta-llama/Llama-3.1-8B-Instruct` y se ha ajustado finamente sobre un subconjunto verificado de etiquetas del dataset MACD, donde las anotaciones de ground-truth, GPT-5.4 y Claude Opus 4.5 coinciden. Este enfoque de "spot-check" busca mejorar la fiabilidad de la moderación de contenido en lenguas indias, un problema relevante dado el crecimiento de contenido generado por usuarios en estas lenguas.

El adaptador se publica bajo la licencia llama3.1 y está disponible en formato PEFT con pesos safetensors. Su tamaño de repositorio es de 0.1 GB, lo que lo hace ligero para integrar sobre el modelo base. El modelo está pensado para clasificación binaria de texto (abusive/no-abusive) y reporta una mejora significativa en F1 macro respecto al entrenamiento con todas las etiquetas, pasando de 0.8923 a 0.9497 en el conjunto de prueba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (adaptador de 0.1 GB; modelo base no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16) |
| Idiomas soportados | telugu (te), ingles (en) |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Llama-3.1-8B-Instruct, un transformer autoregresivo. El ajuste fino emplea LoRA con r=16, lora_alpha=32, dropout de 0.05 y módulos objetivo q_proj, k_proj, v_proj y o_proj. Se entrenó durante 3 épocas con una tasa de aprendizaje de 2×10⁻⁴ y precisión bfloat16. El conjunto de entrenamiento consiste en 18,865 muestras del subconjunto "label-verified" del dataset MACD en telugu, donde las etiquetas de ground-truth, GPT-5.4 y Claude Opus 4.5 coinciden. Este filtrado busca reducir el ruido en las etiquetas y mejorar la robustez del clasificador.

## Capacidades

- Clasificación binaria de discurso de odio: el modelo devuelve 1 si el texto contiene abuso u odio, 0 si no.
- Especializado en telugu, aunque también acepta entradas en inglés.
- Integración sencilla con el ecosistema Hugging Face mediante `PeftModel`.
- Inferencia determinista: genera solo "0" o "1" sin explicaciones, adecuado para pipelines de moderación automática.
- No se documentan capacidades adicionales como generación de texto libre, tool calling o razonamiento multi-paso.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede integrarse en sistemas de filtrado automático para detectar comentarios abusivos en telugu, reduciendo la carga de moderadores humanos.
- Verificación de etiquetas en datasets: sirve como herramienta de "spot-check" para validar anotaciones existentes en corpus de odio, gracias a su entrenamiento sobre etiquetas consensuadas.
- Monitorización de foros y comunidades online: puede analizar publicaciones en tiempo real y marcar contenido potencialmente dañino para revisión posterior.
- Investigación académica en PNL multilingüe: útil para estudiar la fiabilidad de modelos multilingües en moderación de contenido en lenguas indias.
- Sistemas de alerta temprana: en plataformas de noticias o blogs, puede señalar comentarios que inciten al odio antes de que se propaguen.
- Evaluación comparativa de adaptadores LoRA: su diseño con etiquetas verificadas lo convierte en un punto de referencia para otros intentos de fine-tuning en telugu.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de prueba (test N=2,372):

| Configuracion | Training N | Test N | Macro F1 |
|---|---|---|---|
| Original (todas las etiquetas) | 24,000 | 3,000 | 0.8923 |
| Spot-check (este adaptador) | 18,865 | 2,372 | 0.9497 |
| Diferencia | -5,135 | -628 | +0.0574 |

No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.1 GB), pero requiere cargar el modelo base Llama-3.1-8B-Instruct, que necesita aproximadamente 16 GB de VRAM en bfloat16 para inferencia.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o H100.
- En GPUs de consumo con 8 GB (p. ej., RTX 3060) no es viable sin cuantización del modelo base, aunque el adaptador en sí es pequeño.
- Opciones de despliegue: se puede usar con `transformers` y `peft` en Python, o exportar a formatos como GGUF para `llama.cpp` u Ollama, aunque no se documenta explícitamente.
- No se especifican latencias ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia es el adaptador original (sin spot-check) del mismo autor, que se muestra en la tabla de benchmarks. No se pueden comparar con otros modelos de detección de odio en telugu sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para clasificación binaria de odio; no es adecuado para otras tareas de generación o análisis de texto.
- Su rendimiento se ha evaluado únicamente en el subconjunto verificado de MACD; puede degradarse en dominios o estilos de escritura diferentes.
- La licencia llama3.1 impone restricciones de uso comercial y requiere atribución; es necesario revisar los términos completos antes de desplegarlo en producción.
- Al ser un adaptador sobre un modelo base grande, hereda posibles sesgos del modelo original, aunque el fine-tuning específico puede mitigarlos parcialmente.
- No se documentan pruebas de robustez frente a ataques adversariales o variaciones dialectales del telugu.
- El número de descargas y likes es cero, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sravanigunnu/llama-3.1-8b-macd-telugu-spotcheck-lora
- Perfil del autor: https://huggingface.co/Sravanigunnu
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
