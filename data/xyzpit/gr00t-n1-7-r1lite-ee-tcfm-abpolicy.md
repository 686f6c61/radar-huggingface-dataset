# XYZPIT/GR00T-N1.7-R1Lite-EE-TCFM-ABPolicy

## Resumen

GR00T-N1.7-R1Lite-EE-TCFM-ABPolicy es un ajuste fino (fine-tune) del modelo fundacional de robótica nvidia/GR00T-N1.7-3B, publicado por el usuario XYZPIT en Hugging Face. Se trata de una política de control para robots bimanuales que opera directamente sobre los efectores finales (end-effectors) y las pinzas, no sobre el espacio articular completo. El modelo tiene 3.144.016.000 parámetros y un repositorio de 12,6 GB en formato safetensors.

La política se ha entrenado durante 150.000 pasos sobre un conjunto de datos denominado R1Lite, orientado a tareas bimanuales. En cada inferencia devuelve 32 pasos futuros de trayectoria para ambos efectores finales y sus pinzas, lo que la convierte en un generador de secuencias de acción a corto plazo más que en un controlador paso a paso. Es relevante porque ejemplifica el patrón actual de especialización de modelos fundacionales de robótica mediante ajuste fino sobre hardware concreto.

El aspecto más crítico para su uso es que la inferencia exige una rama personalizada del repositorio Isaac-GR00T, denominada `n1d7_tcfm_abpolicy`, junto con su procesador específico ("spline-aware processor"). Sin ese entorno exacto, los pesos no son utilizables de forma estándar, lo que limita seriamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de robótica GR00T-N1.7; detalles internos no especificados en la información disponible) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no aplica de forma directa) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. El modelo hereda la del modelo base nvidia/GR00T-N1.7-3B, un modelo fundacional de robótica de NVIDIA, pero la model card del ajuste fino no describe la topología (transformer, mezcla de expertos, etc.), el número de tokens de entrenamiento ni la composición del dataset.

Lo que sí se especifica es el procedimiento de ajuste fino: 150.000 pasos de entrenamiento sobre datos de la configuración R1Lite, con una política dual-arm que predice acciones en el espacio de efector final (posición/orientación del efector y estado de la pinza) en lugar de articular. La salida es un horizonte de 32 pasos futuros para ambos brazos y pinzas. El sufijo "TCFM" y "ABPolicy" de la model card sugiere componentes específicos (posiblemente "temporal conditional flow matching" y "action-block policy"), pero no se detalla su funcionamiento. La innovación operativa destacable es el procesador "spline-aware", que presumiblemente interpola las trayectorias predichas con splines para generar comandos suaves, aunque su implementación exacta no está documentada en la información disponible.

## Capacidades

- Generación de políticas de control robótico bimanual en el espacio de efector final y pinza.
- Predicción de 32 pasos futuros de trayectoria por inferencia para ambos brazos.
- Control de pinzas (apertura/cierre) junto con la pose del efector final.
- Ajuste fino sobre el modelo fundacional GR00T-N1.7, heredando su representación multimodal del entorno (percepción y acción), aunque los detalles no se especifican.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad de lenguaje; la política genera secuencias de acción, no razonamiento simbólico.
- Capacidades multilingües: no disponibles (modelo no orientado a texto).
- Capacidades especiales: horizonte de predicción de 32 pasos, integración con procesador spline-aware y dependencia de una rama específica de Isaac-GR00T.

## Casos de uso

- Manipulación bimanual en laboratorio: la política puede ejecutar tareas de dos brazos coordinadas (por ejemplo, recoger y ensamblar objetos) generando 32 pasos de trayectoria por inferencia, adecuada para entornos controlados donde se dispone de la rama Isaac-GR00T requerida.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar políticas de efector final frente a políticas articulares, dado que su salida es directamente en el espacio de efector y pinza.
- Prototipado de control de pinzas: el modelo predice el estado de las pinzas junto con la pose, lo que permite probar estrategias de agarre en simulación o en un banco de pruebas con el hardware R1Lite.
- Evaluación de generalización de modelos fundacionales: al ser un fine-tune de GR00T-N1.7-3B, permite estudiar cuánto conocimiento del modelo base se transfiere a una tarea concreta tras 150.000 pasos de ajuste.
- Generación de trayectorias suaves: con el procesador spline-aware, las 32 predicciones pueden convertirse en comandos continuos para los controladores de bajo nivel, útil en tareas que requieren movimiento fluido.
- Reproducción de experimentos: investigadores que trabajen con la rama `n1d7_tcfm_abpolicy` pueden usar estos pesos como referencia para validar su pipeline de inferencia y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.144 millones de parámetros, en precisión completa (fp32) se necesitarían aproximadamente 12,6 GB solo para los pesos; en fp16/bf16, unos 6,3 GB, y en cuantización de 8 bits, unos 3,1 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría en GPUs de consumo con 12-16 GB o más (por ejemplo, RTX 4080/4090) en precisión reducida, y en GPUs de datacenter (A100, H100) sin problema, pero no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente sí en fp16/bf16 con 8 GB o más de VRAM, pero la dependencia de la rama Isaac-GR00T y del procesador spline-aware puede imponer requisitos adicionales no documentados.
- Opciones de despliegue: la model card indica que la inferencia requiere la rama personalizada `n1d7_tcfm_abpolicy` de Isaac-GR00T y su procesador específico. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-R1Lite-EE-TCFM-ABPolicy | 3.144 M | no disponible | Política robótica bimanual (fine-tune) | no disponible | Hugging Face, requiere rama Isaac-GR00T |
| nvidia/GR00T-N1.7-3B (modelo base) | ~3.000 M | no disponible | Modelo fundacional de robótica | no disponible en la información | Hugging Face (NVIDIA) |
| Otras políticas de efector final | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica de una rama personalizada de Isaac-GR00T (`n1d7_tcfm_abpolicy`) y de un procesador spline-aware concreto: sin ese entorno, los pesos no son utilizables de forma estándar.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Modelo altamente especializado: entrenado para una configuración concreta (R1Lite, bimanual, efector final) y no es un modelo de propósito general.
- Riesgo de sobreajuste al dataset de entrenamiento: 150.000 pasos de ajuste fino sobre un conjunto específico pueden reducir la generalización a otras tareas u objetos.
- Sin datos publicados de benchmarks, latencia ni robustez: no hay evidencia cuantitativa de su rendimiento fuera del entorno del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad.
- Sin información sobre sesgos, alucinación (en el sentido de predicciones erróneas de acción) ni límites de contexto; en robótica, los fallos de política pueden provocar daños físicos, por lo que se recomienda supervisión y límites de seguridad en el controlador de bajo nivel.
- Idiomas no aplicables, pero la documentación solo está en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/XYZPIT/GR00T-N1.7-R1Lite-EE-TCFM-ABPolicy
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio Isaac-GR00T (rama requerida `n1d7_tcfm_abpolicy`): no disponible en la información proporcionada.
