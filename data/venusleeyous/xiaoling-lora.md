# venusleeyous/xiaoling-lora

## Resumen

Xiaoling-lora es un adaptador LoRA de personaje (character LoRA) para el modelo de generación de imagen Krea 2, publicado por el usuario venusleeyous en HuggingFace. Su función es fijar una identidad facial concreta —una mujer joven china llamada "xiaoling"— de forma consistente a través de distintas poses, ángulos, iluminaciones, peinados y vestuarios. El disparador es la palabra `xiaoling`, que debe incluirse en el prompt.

El repositorio no contiene un modelo completo, sino cinco checkpoints de una misma tanda de entrenamiento v2 (pasos 1000, 1100, 1200, 1300 y 1400), junto con el archivo de configuración original (`config.yaml`) y los resultados de una evaluación cualitativa con siete prompts y semillas fijas (`evaluation.json`). El peso total del repositorio es de 0,9 GB y los pesos se distribuyen en archivos `.safetensors` independientes.

Es relevante para quienes trabajan con Krea 2 en ComfyUI y necesitan identidad de personaje estable sin reentrenar el modelo base: el LoRA se entrena sobre Krea 2 Raw pero se infiere en las demostraciones con Krea 2 Turbo INT8, lo que ofrece un caso documentado de reutilización de un adaptador entre variantes del mismo modelo. No se han publicado resultados cuantitativos de benchmarks ni requisitos de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión Krea 2; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | no disponible (rank 24 y alpha 24; repositorio de 0,9 GB repartido en cinco checkpoints) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imagen); resolución de entrenamiento 512 y 768 con bucketing multirresolución, inferencia de demostración a 1184 × 1776 |
| Tipos de cuantización | Pesos LoRA: no disponible. Entrenamiento con modelo y codificador de texto en qfloat8; las demostraciones usan `krea2_turbo_int8_convrot.safetensors` (INT8) y `qwen3vl_4b_fp8_scaled.safetensors` (FP8) |
| Idiomas soportados | zh, en (etiquetas del repositorio); los siete prompts de evaluación están redactados en inglés |
| Licencia | no disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (cinco archivos LoRA) |
| Tamaño del repositorio | 0,9 GB |
| Fecha de publicación | 4 de octubre de 2026 (actualizado el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Se trata de un LoRA de difusión, no de un transformer de lenguaje. La adaptación se entrenó con la herramienta `ostris ai-toolkit` sobre el modelo base Krea 2 Raw, con rank y alpha de 24, precisión bf16 y cuantización qfloat8 tanto del modelo como del codificador de texto. El entrenamiento se realizó a resoluciones de 512 y 768 píxeles mediante bucketing multirresolución, con batch de 1 y acumulación de gradiente de 2 (lote efectivo 2), optimizador AdamW8bit y tasa de aprendizaje 0,0002. El condicionamiento textual usa captions con embeddings de texto precalculados en caché: el codificador de texto no se entrena.

La tanda completa consta de 1400 pasos y el autor publica cinco checkpoints intermedios (1000, 1100, 1200, 1300 y 1400) para permitir la comparación del sobreajuste y la fidelidad de identidad a lo largo del entrenamiento. La inferencia documentada usa el pipeline de ComfyUI con el modelo `krea2_turbo_int8_convrot.safetensors`, el codificador de texto `qwen3vl_4b_fp8_scaled.safetensors` y el VAE `qwen_image_vae.safetensors`, con muestreador Euler, planificador simple, 8 pasos, CFG 1.0 y negative prompt anulado mediante `ConditioningZeroOut`. No se detalla la composición del dataset de entrenamiento (número de imágenes, procedencia, resolución original ni proceso de curado), lo que constituye una laguna importante para evaluar sesgos y derechos de imagen.

## Capacidades

- Generación de retratos fotorrealistas de un personaje concreto mediante la palabra disparadora `xiaoling`.
- Consistencia de identidad facial en primer plano y plano medio, con textura de piel natural según los prompts de evaluación.
- Variación controlada de pose y ángulo: frontal (P1), tres cuartos hacia la izquierda y la derecha (P2, P6), caminando y mirando atrás (P3) y perfil lateral (P5, H).
- Cambio de vestuario manteniendo la identidad: jersey de punto, abrigo rojo, gabardina, cárdigan, abrigo de lana y chaqueta navy.
- Cambio de peinado: el prompt H fuerza un bob corto ondulado sin recogido, distinto del peinado habitual, y el prompt P6 pide pelo suelto en lugar de recogido.
- Adaptación a iluminaciones y escenarios variados: luz natural fría de biblioteca, luz de estación de metro, luz difusa de museo, crepúsculo urbano, amanecer en montaña y calle urbana desenfocada.
- Integración con ComfyUI mediante nodo de carga de LoRA, con strength_model y strength_clip ajustables (1.0 en las pruebas).
- No documentado: tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio, renderizado de texto en imagen o soporte de prompts en chino más allá de la etiqueta de idioma del repositorio.

## Casos de uso

- Producción de ilustración editorial con personaje recurrente: el LoRA mantiene la identidad facial entre escenas (biblioteca, museo, calle, montaña), lo que permite generar un conjunto de ilustraciones coherentes para un reportaje o un libro sin repintar el rostro en cada imagen.
- Diseño de vestuario y caracterización: los prompts P6 y H demuestran que se puede cambiar ropa y peinado conservando el rostro, útil para previsualizar estilismos antes de una sesión fotográfica real.
- Storyboard y previsualización de guion gráfico: con semillas fijas y siete prompts de referencia, un equipo puede generar viñetas con un personaje estable para presentar una narrativa antes de la producción definitiva.
- Assets para novela visual o videojuego narrativo: el LoRA permite generar retratos de expresión y ángulo controlados (frontal, tres cuartos, perfil) que alimentan un sistema de diálogo con sprites coherentes.
- Pruebas comparativas de puntos de entrenamiento: los cinco checkpoints (1000 a 1400) permiten evaluar sobreajuste y fidelidad de identidad en el mismo conjunto de prompts y semillas, y elegir el punto óptimo para un despliegue propio.
- Plantilla de reentrenamiento: el `config.yaml` publicado sirve como punto de partida documentado para entrenar otros personajes con ai-toolkit sobre Krea 2 Raw, ajustando rutas de modelo, dataset y directorio de salida.
- Generación de material de referencia para fotografía o casting: el modelo puede producir variaciones de iluminación y encuadre del mismo rostro para discutir propuestas visuales con un cliente antes de un rodaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas cuantitativas (FID, CLIP score, similitud facial, etc.) ni comparaciones numéricas con otros adaptadores.

La única evaluación es cualitativa y sigue un protocolo fijo, que se reproduce a continuación porque define la reproducibilidad del resultado:

| Elemento | Valor |
|---|---|
| Checkpoints evaluados | 1000, 1100, 1200, 1300, 1400 |
| Prompts | P1 (biblioteca, frontal), P2 (metro, tres cuartos), P3 (museo, mirando atrás), P4 (azotea, risa), P5 (montaña, perfil), P6 (cambio de peinado y ropa), H (perfil con bob corto ondulado) |
| Semillas | 101, 102, 103, 104, 105, 106 y 105 (H) |
| Imágenes por prompt y checkpoint | 1 |
| Muestreador / planificador | Euler / simple |
| Pasos / CFG | 8 / 1.0 |
| Resolución | 1184 × 1776 |
| LoRA strength_model / strength_clip | 1.0 / 1.0 |
| Negative prompt | conditioning positivo anulado con ConditioningZeroOut |

El propio autor advierte que cada grupo usa una sola semilla y que los resultados no representan el comportamiento del modelo con todos los prompts posibles.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica cifras. Los componentes que deben residir en memoria son el modelo base (`krea2_turbo_int8_convrot.safetensors`, INT8), el codificador de texto `qwen3vl_4b_fp8_scaled.safetensors` (un modelo de 4B en FP8, del orden de 4-5 GB solo en pesos, estimación aritmética no confirmada por el autor) y el VAE `qwen_image_vae.safetensors`.
- GPU recomendadas: no disponible. No hay indicación de qué aceleradores se usaron en las pruebas.
- Viabilidad en GPU de consumo: no disponible, aunque el uso de un checkpoint INT8 del modelo base y de un codificador de texto FP8 apunta a una configuración orientada a reducir huella de memoria frente a versiones en bf16.
- Opciones de despliegue: ComfyUI es el entorno documentado (colocar el `.safetensors` en `models/loras`, cargarlo con el nodo de LoRA e incluir `xiaoling` en el prompt). `ai-toolkit` es la herramienta usada para el entrenamiento y el reentrenamiento. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Solo se documenta que la inferencia de demostración emplea 8 pasos a 1184 × 1776 píxeles.
- Almacenamiento: 0,9 GB para el repositorio completo, con cinco checkpoints duplicados; basta con descargar el checkpoint elegido si no se necesita la comparativa completa.

## Comparativa con modelos similares

No se dispone de datos publicados de otros LoRA de personaje para Krea 2, por lo que no es posible una comparativa técnica rigurosa de parámetros, contexto o rendimiento dentro de la misma familia.

La búsqueda web devuelve modelos con el mismo nombre que no guardan relación con este adaptador y no son comparables: usan otras arquitecturas base y otros pipelines.

| Modelo | Base | Pipeline | Relación con este repositorio |
|---|---|---|---|
| venusleeyous/xiaoling-lora | Krea 2 Raw (entrenamiento) | text-to-image | Objeto de esta ficha; licencia y parámetros no disponibles |
| Xiaoling (Saint Seiya Saintia Sho) de ronoko (PixAI) | no especificada | generación de imagen | Sin relación: personaje de anime distinto, plataforma distinta |
| Xiaoling (Saint Seiya Saintia Sho) - 1 de Ikki de Fénix (Tensor.Art) | Illustrious | generación de imagen | Sin relación: personaje de anime distinto, base distinta |
| 小凌 de 小桃 (Tensor.Art) | SDXL 1.0 | generación de imagen | Sin relación: personaje distinto, base distinta |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la model card ni en los metadatos, no puede asumirse uso comercial. Cualquier despliegue en producción requiere contactar con el autor para aclarar los términos.
- Derechos de imagen e identidad: el adaptador reproduce el rostro de una persona concreta descrita como "mujer joven china". No se documenta el consentimiento, la procedencia de las imágenes de entrenamiento ni su licencia, lo que supone un riesgo legal y ético relevante, incluida la posibilidad de usos de suplantación o contenido no consentido.
- Dataset no documentado: se desconoce el número de imágenes, su resolución original, la composición demográfica y los posibles sesgos heredados. Sin estos datos no es posible auditar sesgos de representación.
- Riesgo de alucinación visual y deriva de identidad: en prompts alejados del retrato de estudio (escenas de cuerpo entero, acciones complejas, multitud de personas) la fidelidad facial puede degradarse; el autor no documenta pruebas en esos escenarios.
- Evaluación muy limitada: la validación se reduce a siete prompts con una única semilla por prompt y checkpoint. No hay métricas cuantitativas ni pruebas estadísticas, por lo que las conclusiones sobre calidad son indicativas, no concluyentes.
- Desajuste entre entrenamiento e inferencia: el LoRA se entrenó sobre Krea 2 Raw pero las demostraciones usan Krea 2 Turbo INT8. El comportamiento con otros checkpoints o cuantizaciones del modelo base no está documentado.
- Dependencia estricta del ecosistema Krea 2 y de rutas concretas: los pesos solo son utilizables con ese modelo base y en ComfyUI según las instrucciones; el `config.yaml` conserva rutas locales del autor que deben reajustarse para reutilizarlo.
- Idioma: aunque el repositorio se etiqueta como zh y en, todos los prompts de evaluación están en inglés; no hay evidencia publicada de que la palabra disparadora funcione igual de bien con prompts en chino.
- Señales de validación comunitaria nulas: cero descargas y cero likes en el momento de los datos, sin issues ni informes de terceros que confirmen el comportamiento fuera del conjunto de demostración.
- Advertencia sobre tamaños de archivo: el repositorio de 0,9 GB incluye cinco checkpoints de la misma tanda; descargar todos duplica espacio sin aportar variedad de estilos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/venusleeyous/xiaoling-lora
- Configuración de entrenamiento citada en la model card: `config.yaml` (dentro del repositorio)
- Resultados de evaluación citados en la model card: `evaluation.json` (dentro del repositorio)
- Checkpoints: `xiaoling_lora_000001000.safetensors`, `xiaoling_lora_000001100.safetensors`, `xiaoling_lora_000001200.safetensors`, `xiaoling_lora_000001300.safetensors`, `xiaoling_lora_000001400.safetensors` (dentro del repositorio)
- Ejemplos generados: carpetas `examples/1000` a `examples/1400` y previsualizaciones en `examples/previews` (dentro del repositorio)
- No se han encontrado en la búsqueda web enlaces relevantes a este modelo: los resultados obtenidos (PixAI https://pixai.art/en/model/1922438728121887727, Tensor.Art https://tensor.art/models/977492232082868133 y https://tensor.art/models/938314937346880616) corresponden a LoRA homónimos sobre otras bases y no documentan este adaptador.
