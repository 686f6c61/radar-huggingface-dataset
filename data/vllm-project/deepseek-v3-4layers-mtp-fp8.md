# vllm-project/DeepSeek-V3-4layers-MTP-FP8

## Resumen

DeepSeek-V3-4layers-MTP-FP8 es un checkpoint reducido de la arquitectura DeepSeek-V3, publicado por el equipo de vLLM (organización vllm-project) en Hugging Face. No se trata de un modelo entrenado de forma independiente, sino de una copia de un checkpoint de ZixiQi creada el 30 de octubre de 2026 para que el sistema de integración continua (CI) de vLLM disponga de una versión estable y bajo control de la cadena de suministro. El modelo conserva la arquitectura original de DeepSeek-V3 pero con solo 4 capas y 8 expertos por capa MoE, además del módulo MTP (Multi-Token Prediction) y pesos en FP8 derivados del modelo original sin ajuste adicional.

Con 6.727.036.944 parámetros totales (aproximadamente 6,7 mil millones) y un repositorio de 10,5 GB, el checkpoint está pensado exclusivamente para pruebas de CI: permite validar rutas de código de vLLM relacionadas con MoE, FP8 y decodificación especulativa MTP sin necesidad de cargar el DeepSeek-V3 completo, que ronda los 671 mil millones de parámetros. Su licencia MIT y su formato safetensors lo hacen fácilmente integrable en pipelines automatizados.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto de infraestructura que los desarrolladores de vLLM pueden encontrar al explorar el ecosistema; por otro, sirve como ejemplo de checkpoint "de arquitectura" que no debe confundirse con un modelo listo para producción. No hay información publicada sobre idiomas soportados, pipeline de inferencia ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer DeepSeek-V3 con MoE (8 expertos por capa) y módulo MTP; 4 capas |
| Parametros totales | 6.727.036.944 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos en FP8); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint reproduce la arquitectura DeepSeek-V3 en una versión truncada a 4 capas, con 8 expertos por capa en las capas MoE y un módulo MTP (Multi-Token Prediction) que en el modelo original se emplea para decodificación especulativa y predicción de múltiples tokens. Los pesos están en FP8 y, según la model card, provienen del modelo original "sin ajuste adicional" (without further tuning); es decir, no ha habido un entrenamiento específico para esta versión reducida, sino una extracción y conversión de pesos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre fases de RLHF o DPO aplicadas a este checkpoint concreto. La única innovación técnica documentada es la presencia del módulo MTP y el uso de FP8, coherente con el objetivo de probar en CI las rutas de vLLM para modelos DeepSeek-V3 con cuantización FP8 y decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento: hereda la arquitectura de DeepSeek-V3, pero al tener solo 4 capas y 8 expertos, su capacidad real de generación es muy limitada y no representa el rendimiento del modelo completo.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: incluye módulo MTP para predicción multi-token, útil para validar decodificación especulativa en vLLM.
- Uso previsto: pruebas de integración continua del motor vLLM, no inferencia en producción.

## Casos de uso

- Pruebas de CI en vLLM: el checkpoint se carga en los tests automatizados para verificar que las rutas de código de DeepSeek-V3 (MoE, FP8, MTP) funcionan correctamente sin requerir el modelo completo de 671B.
- Validación de decodificación especulativa: al incluir el módulo MTP, permite probar en CI la lógica de predicción multi-token y su integración con el scheduler de vLLM.
- Verificación de carga de pesos FP8: sirve para comprobar que el pipeline de conversión y carga de safetensors en FP8 funciona con la arquitectura DeepSeek-V3.
- Pruebas de regresión en kernels MoE: con 8 expertos por capa y 4 capas, se pueden ejecutar tests de enrutamiento de expertos y de kernels agrupados sin un coste computacional elevado.
- Desarrollo de herramientas de perfilado: al ser un modelo pequeño (6,7B parámetros), permite medir latencia y throughput de las rutas de vLLM en un entorno controlado antes de escalar al modelo completo.
- Integración en pipelines de evaluación de vLLM: se puede usar como modelo "smoke test" en entornos de staging para detectar roturas de compatibilidad en nuevas versiones del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,7B parámetros en FP8, los pesos ocupan aproximadamente 6,7 GB; sumando overhead de activaciones y caché KV, se estima un mínimo de 10-12 GB de VRAM para inferencia básica.
- GPU recomendadas: al ser un checkpoint de CI, es adecuado para GPUs de gama media como RTX 4090 (24 GB), A10G (24 GB), L4 (24 GB) o A100 (40/80 GB) si se quiere margen para pruebas concurrentes.
- Cabe en GPU de consumo: sí, en GPUs con 12 GB o más de VRAM, aunque el tamaño exacto depende de la longitud de contexto y del batch.
- Opciones de despliegue: vLLM (uso previsto principal); no se documenta soporte para llama.cpp, Ollama o TGI, y al ser un checkpoint de arquitectura truncada no se recomienda su uso fuera de CI.
- Latencia y throughput: no disponibles; al ser un modelo de 4 capas, la latencia sería muy inferior a la del DeepSeek-V3 completo, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Uso previsto |
|---|---|---|---|---|---|
| vllm-project/DeepSeek-V3-4layers-MTP-FP8 | 6,7B | no disponible | MIT | Hugging Face | CI de vLLM |
| DeepSeek-V3 (original) | 671B (37B activos) | 128K (según documentación pública del modelo original) | Licencia propia de DeepSeek | Hugging Face | Producción e investigación |
| ZixiQi/DeepSeek-V3-4layers-MTP-FP8 | 6,7B | no disponible | MIT | Hugging Face | CI de vLLM (origen de esta copia) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo para producción: se trata de un checkpoint truncado a 4 capas, pensado exclusivamente para pruebas de CI; su calidad de generación no es representativa de DeepSeek-V3.
- Sesgos conocidos: no documentados; al derivar del modelo original sin ajuste, podría heredar sesgos de este, pero no hay información al respecto.
- Riesgo de alucinación: alto en cualquier uso generativo real, dado que la arquitectura truncada no ha sido entrenada para tareas de generación.
- Limitaciones de contexto e idioma: no disponibles; no se documenta longitud de contexto ni idiomas soportados.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación, pero el uso previsto es CI; no hay restricciones adicionales documentadas.
- Caveat de producción: no debe desplegarse como modelo de inferencia para usuarios finales; su función es validar rutas de código de vLLM.
- Cadena de suministro: es una copia de un checkpoint alojado en una cuenta personal (ZixiQi), mantenida por vLLM para reducir riesgos; conviene verificar el commit `6553d61` si se necesita reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/DeepSeek-V3-4layers-MTP-FP8
- Checkpoint original: https://huggingface.co/ZixiQi/DeepSeek-V3-4layers-MTP-FP8
- Repositorio de vLLM: no disponible en la información proporcionada
- Paper de DeepSeek-V3: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
