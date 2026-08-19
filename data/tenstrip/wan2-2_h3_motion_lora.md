# TenStrip/Wan2.2_H3_Motion_Lora

## Resumen

Wan2.2_H3_Motion_Lora es un LoRA experimental desarrollado por TenStrip que injerta capas de atención del modelo de video Wan2.2 en los bloques intermedios y tardíos del modelo MiniMax-H3, un generador de video de alta calidad. El objetivo es transferir el estilo de movimiento característico de Wan2.2 al modelo H3, modificando la dinámica temporal de la generación sin alterar la arquitectura base. El LoRA se extrae de una rama de "attn graft" (injerto de atención) y utiliza un mapeo de picos (peak mapping) para alinear los bloques de Wan2.2, que están invertidos respecto a los de H3. Con un tamaño de repositorio de 2,1 GB, el LoRA está disponible en dos variantes de rango (512 y 1024) que capturan respectivamente el 41,6% y el 69% del delta residual ortogonal de la versión fusionada completa. Es un trabajo puramente experimental, sin ajuste de timestep, y el autor reconoce que aún busca recomendaciones sobre mejores modelos Wan2.2 (fp16) para mejorar la transferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre MiniMax-H3 (modelo de video) con capas de atención de Wan2.2 |
| Parametros totales | no disponible (el LoRA tiene rangos 512 y 1024) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (presumible, no confirmado) |

## Arquitectura y entrenamiento

El modelo base es MiniMax-H3, un generador de video que procesa entradas de texto e imagen para producir secuencias de video. El LoRA modifica selectivamente los bloques H3 intermedios y tardíos, reemplazando o complementando sus mecanismos de atención con las capas de atención de Wan2.2. Wan2.2 es un modelo de video de código abierto (variantes de 5B y 14B) que genera video a 720p y 24 fps. El autor utiliza un "peak mapping" para alinear los bloques de Wan2.2, que están en orden inverso, con los de H3. No se ajusta el timestep, a pesar de que Wan2.2 opera a 16 fps y H3 tiene su propio esquema temporal. El entrenamiento se realizó mediante extracción de pesos de una versión fusionada completa del modelo injertado, y los resultados muestran que a rango 512 se captura el 41,6% del delta residual ortogonal, mientras que a rango 1024 se alcanza el 69%. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de optimización.

## Capacidades

- Modificación del estilo de movimiento en generación de video, tendiendo hacia movimientos repetitivos característicos de Wan2.2.
- Transferencia de patrones de atención entre dos arquitecturas de video diferentes.
- Soporte de entrada de texto e imagen (pipeline image-text-to-video).
- Capacidad de ajuste fino mediante LoRA sin necesidad de reentrenar el modelo completo.
- Posibilidad de experimentar con diferentes rangos (512 y 1024) para controlar la fidelidad de la transferencia.
- No se documentan capacidades de tool calling, agentes ni razonamiento multimodal adicional.

## Casos de uso

- Investigación en transferencia de estilos de movimiento: permite estudiar cómo las capas de atención de un modelo de video pueden influir en la dinámica temporal de otro, útil para laboratorios que trabajan en generación de video.
- Prototipado de efectos de movimiento: los creadores de contenido pueden aplicar este LoRA sobre MiniMax-H3 para obtener movimientos con la estética de Wan2.2, aunque con limitaciones de calidad por la captura parcial del delta.
- Benchmarking de técnicas de injerto de atención: sirve como caso de estudio para comparar metodologías de fusión de arquitecturas en modelos generativos.
- Desarrollo de LoRAs de video: los resultados pueden guiar a otros investigadores sobre cómo extraer y transferir subredes entre modelos de video.
- Experimentación académica en generación de video: ideal para tesis o proyectos que exploren la modularidad de los transformadores de video.
- Ajuste de estilo en pipelines de generación de video: puede combinarse con otros LoRAs para modificar selectivamente el comportamiento de MiniMax-H3 en producción, siempre que se acepte su naturaleza experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA pesa 2,1 GB, pero requiere el modelo base MiniMax-H3 para funcionar, cuyo tamaño no se especifica en la ficha.
- Dado que MiniMax-H3 es un modelo de video de alta calidad, se espera que necesite GPUs con al menos 24 GB de VRAM para inferencia básica, aunque no hay datos confirmados.
- Para aplicar el LoRA se necesita un framework que soporte LoRAs sobre modelos de video, como Diffusers o herramientas específicas de MiniMax.
- No se dispone de información sobre latencia o throughput.
- No se confirma si es ejecutable en GPUs de consumo como la RTX 4090; el autor menciona que Wan2.2 puede correr en esa GPU, pero H3 podría tener requisitos superiores.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 (base) | Video | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace |
| Wan2.2 (5B) | Video | 5B | no disponible | Apache 2.0 (según repo) | HuggingFace, GitHub |
| Wan2.2_H3_Motion_Lora | LoRA | no disponible | no disponible | minimax-h3-community-license-agreement | HuggingFace |

La comparativa directa con otros LoRAs de video no es posible por falta de datos públicos. El LoRA se posiciona como una modificación experimental sobre MiniMax-H3, sin competidores directos conocidos.

## Limitaciones y advertencias

- Es un trabajo experimental: el autor lo califica explícitamente como "all experimental" y no garantiza resultados estables.
- Captura parcial del delta: a rango 512 solo se transfiere el 41,6% del delta residual, lo que puede producir movimientos poco naturales o incompletos.
- Tendencia a movimientos repetitivos: el estilo resultante se asemeja al de Wan2.2 antiguo, con repeticiones que pueden ser indeseables para usos profesionales.
- Licencia restrictiva: la licencia minimax-h3-community-license-agreement puede limitar el uso comercial; es necesario revisar sus términos exactos.
- Sin ajuste de timestep: la diferencia de fps entre Wan2.2 (16) y H3 no se compensa, lo que puede causar artefactos temporales.
- Falta de documentación sobre entrenamiento: no se especifican datos de entrenamiento, hiperparámetros ni proceso de evaluación.
- Riesgo de alucinación visual: como cualquier modelo de video, puede generar contenido no fiel a la entrada, especialmente con el injerto de atención.

## Enlaces

- [HuggingFace - TenStrip/Wan2.2_H3_Motion_Lora](https://huggingface.co/TenStrip/Wan2.2_H3_Motion_Lora)
- [README del modelo](https://huggingface.co/TenStrip/Wan2.2_H3_Motion_Lora/blob/main/README.md)
- [GitHub - Wan-Video/Wan2.2](https://github.com/Wan-Video/Wan2.2)
- [Licencia MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
