# townhouseadmin/mistress

## Resumen

`townhouseadmin/mistress` es un adaptador LoRA de DreamBooth para generación de imágenes a partir de texto, entrenado sobre el modelo base **krea/Krea-2-Raw** y pensado para ejecutarse sobre **Krea 2 Turbo**. No es un modelo de lenguaje: es un ajuste fino de bajo rango sobre un modelo de difusión de la familia Krea 2, publicado en HuggingFace bajo la librería `diffusers` con la etiqueta `template:sd-lora`.

El adaptador inyecta un concepto visual concreto, invocado mediante el token de activación `vqx woman`. La model card demuestra su funcionamiento con tres ejemplos generados en Turbo a 8 pasos y con `guidance_scale=0.0`, cubriendo estilos muy distintos (cyberpunk cinematográfico, pintura al óleo y macrofotografía de fantasía), lo que sugiere que el LoRA se centra en la identidad del sujeto y no en un estilo fijo.

Su relevancia es limitada y práctica: se trata de un artefacto recién publicado, con 0 descargas y 0 likes en el momento de la consulta, un repositorio de 0,8 GB y una licencia Apache 2.0. Es útil como ejemplo de flujo de trabajo LoRA sobre Krea 2 y como pieza reutilizable para quien ya trabaje con ese ecosistema, pero no cuenta con validación comunitaria ni documentación técnica sobre el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de texto a imagen; modelo base krea/Krea-2-Raw |
| Parametros totales | no disponible (el repositorio ocupa 0,8 GB; no se desglosa el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; la longitud de prompt no se especifica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (se carga con `pipe.load_lora_weights()` de diffusers; no se detalla el formato del fichero) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se acoplan a las capas del modelo base de difusión sin modificar sus pesos originales. La model card indica explícitamente que se trata de un "DreamBooth-LoRA for Krea 2, trained on Krea 2 RAW", lo que implica una especialización sobre un sujeto o concepto único a partir de un conjunto reducido de imágenes de referencia, con el token `vqx woman` como disparador. El modelo base sobre el que se entrena es la variante Raw, mientras que la inferencia de los ejemplos publicados se realiza sobre la variante Turbo, destilada para pocos pasos.

No se proporciona información sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA, la resolución de entrenamiento ni si hubo regularización o augmentation. Tampoco se documenta ninguna innovación técnica adicional. Los únicos parámetros de inferencia conocidos son los de los ejemplos: 8 pasos de muestreo y `guidance_scale=0.0`, propios del modo Turbo.

## Capacidades

- Generación de imágenes fotorrealistas y estilizadas a partir de prompts de texto en inglés.
- Inyección de un concepto concreto mediante el token de activación `vqx woman`.
- Transferencia de estilo sobre el concepto: los ejemplos incluyen estética cyberpunk cinematográfica, pintura al óleo y macrofotografía de fantasía, lo que indica que la identidad del sujeto se mantiene atravesando distintos estilos.
- Compatibilidad con el ecosistema `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- Ejecución en modo Turbo de pocos pasos (8 en los ejemplos), lo que reduce el coste de inferencia.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento: no es un modelo de lenguaje ni un modelo multimodal de entrada.

## Casos de uso

- Generación de personajes consistentes para narrativa visual: usar `vqx woman` como ancla de identidad para producir un mismo personaje en distintas escenas y estilos, manteniendo coherencia entre ilustraciones de un cuento o cómic.
- Prototipado de arte conceptual: generar variaciones rápidas de un personaje en 8 pasos con Krea 2 Turbo para explorar direcciones estéticas antes de invertir en renderizados de mayor calidad.
- Pruebas de integración de LoRA en pipelines propios: sirve como caso de prueba mínimo para validar que un flujo basado en `Krea2Pipeline` carga correctamente pesos de terceros y respeta el token de activación.
- Material gráfico para campañas o presentaciones internas: los ejemplos publicados abarcan registros muy distintos (cinematográfico, pictórico, macrofotografía), lo que cubre necesidades de imagen de relleno o moodboards.
- Retratos y figuras para juegos de rol o mundos de fantasía: el prompt del tercer ejemplo muestra composiciones con joyería y escenarios naturales, un patrón típico de ilustración de personajes para ambientación.
- Investigación sobre DreamBooth y sobreajuste de conceptos: al ser un LoRA de sujeto único con disparador explícito, resulta un caso útil para estudiar hasta qué punto el concepto contamina prompts no relacionados.
- Demostraciones de despliegue de LoRA sobre modelos destilados: permite medir el impacto del adaptador en calidad y latencia cuando se combina con un modelo Turbo de pocos pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas cuantitativas de FID, CLIP score, similitud de identidad ni comparaciones numéricas con otros adaptadores. La única evidencia de funcionamiento son las tres imágenes de muestra incluidas en la model card.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,8 GB; el peso efectivo del LoRA es una fracción de esa cifra (parte del tamaño puede corresponder a imágenes de muestra). No se especifica el consumo exacto.
- VRAM total para inferencia: no disponible. Viene determinada por el modelo base Krea 2 (Raw o Turbo), cuyo número de parámetros no se detalla en la información proporcionada, y por la precisión usada (`torch.bfloat16` en el ejemplo).
- GPU recomendadas: no disponibles. El código de ejemplo usa `.to("cuda")` con `torch_dtype=torch.bfloat16`, lo que requiere una GPU con soporte de bfloat16 para un rendimiento óptimo.
- Encaje en GPU de consumo: no confirmado. No hay datos sobre si el modelo base cabe en tarjetas de gama consumer como la RTX 4090.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` es el método documentado. No se mencionan vLLM (no aplica), llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modo Turbo a 8 pasos sugiere una latencia baja en comparación con un muestreo de 30-50 pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| townhouseadmin/mistress | LoRA de concepto sobre Krea 2 Raw | no disponible (repo de 0,8 GB) | no aplica | apache-2.0 | 0 descargas, 0 likes |
| krea/Krea-2-Raw | Modelo base de difusión texto a imagen | no disponible | no aplica | no disponible | Modelo base referenciado |
| krea/Krea-2-Turbo | Modelo base destilado para pocos pasos | no disponible | no aplica | no disponible | Modelo base referenciado |

No se dispone de datos de rendimiento, licencia ni especificaciones técnicas de los modelos base más allá de su nombre, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría (otros LoRA de DreamBooth para Krea 2). Comparativa ampliada: no disponible.

## Limitaciones y advertencias

- Alucinación visual inherente a los modelos de difusión: el adaptador puede generar anatomías incorrectas, manos deformes o artefactos en detalles finos, especialmente en prompts alejados del dominio de entrenamiento.
- Sobreajuste de concepto: un LoRA de DreamBooth puede "filtrarse" hacia prompts donde no se invoca el token, alterando la estética de generaciones no relacionadas si se mantiene cargado.
- Dependencia del token de activación: el concepto solo se activa con `vqx woman`; su comportamiento con prompts que no lo incluyan no está documentado.
- Riesgo de memorización: si las imágenes de entrenamiento corresponden a una persona real identificable, el adaptador podría reproducir su apariencia. No se especifica el origen ni el consentimiento sobre los datos de entrenamiento.
- Idiomas: no se declara soporte multilingüe; los únicos prompts publicados están en inglés y se desconoce el comportamiento con castellano u otras lenguas.
- Licencia: el adaptador se publica bajo Apache 2.0, permisiva para uso comercial, pero la licencia del modelo base Krea 2 Raw y Turbo no se detalla en la información disponible. Es necesario verificar las condiciones de dichos modelos antes de cualquier explotación comercial.
- Validación nula: 0 descargas y 0 likes, sin pruebas de terceros ni issues públicos. No se recomienda su uso en producción sin evaluación propia.
- Ausencia de documentación técnica: no se publican datos de entrenamiento, hiperparámetros ni resolución, lo que dificulta reproducir o depurar el adaptador.
- Fecha de publicación adelantada respecto a la fecha de referencia habitual: la metadata indica creación el 17 de septiembre de 2026, un dato a verificar en la fuente original.
- Contexto de uso responsable: el nombre del repositorio y el token de activación sugieren contenido de carácter adulto o sugerente; conviene revisar su idoneidad antes de integrarlo en productos dirigidos al público general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/townhouseadmin/mistress
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia en los ejemplos: https://huggingface.co/krea/Krea-2-Turbo
- Muestras incluidas en el repositorio: sample_0.png, sample_1.png, sample_2.png (rutas relativas dentro del repositorio)
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada (los resultados de la búsqueda web no contenían referencias relevantes al modelo)
