# Wphillipsman/cnn-transformer-classification

## Resumen

Wphillipsman/cnn-transformer-classification es un repositorio de HuggingFace publicado por el usuario Wphillipsman que contiene una implementación funcional de una arquitectura híbrida CNN-Transformer orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un checkpoint con pesos ajustados: el propio autor indica explícitamente en la model card que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests) y que no se presenta como un checkpoint con resultados de benchmark.

El tamaño real del modelo es extremadamente reducido: 33.088 parámetros totales según los datos de safetensors, lo que lo sitúa muy lejos de cualquier modelo de lenguaje o de visión de gran escala. La model card describe una configuración "base" con atención lineal, fusión tipo Tucker, activación approx gelu y normalización layernorm, además de una receta de entrenamiento por defecto basada en RMSProp con schedule polinómico. El repositorio se centra, según su autor, en código transparente y pruebas repetibles, y omite deliberadamente cualquier afirmación de rendimiento.

Su relevancia práctica es, por tanto, la de un artefacto de investigación reproducible y didáctico: sirve como punto de partida para experimentar con hibridaciones CNN-Transformer, validar infraestructura de carga de pesos o construir líneas base de comparación. No es un modelo listo para producción ni para uso en tareas reales sin un entrenamiento y una evaluación previos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (hibrida CNN + Transformer) |
| Parametros totales | 33.088 (dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Escala | base |
| Mecanismo de atencion | linear |
| Fusion | tucker |
| Activacion | approx gelu |
| Normalizacion | layernorm |
| Optimizador por defecto | rmsprop |
| Schedule por defecto | polynomial |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Tamano del repositorio | 0,0 GB |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura combina un extractor de caracteristicas convolucional (CNN) con un bloque Transformer, unidos mediante una fusión de tipo Tucker. La atención es lineal, lo que reduce el coste computacional respecto a la atención softmax cuadrática, y la normalización se realiza con layernorm. La activación es una aproximación de gelu. La model card etiqueta esta configuración como "base", aunque no se especifica el número de capas, dimensiones ocultas, cabezas de atención ni resolución de entrada; el `config.json` del repositorio registra los ajustes generados de la arquitectura, pero esos valores no se han facilitado en la información disponible.

En cuanto al entrenamiento, el repositorio incluye `training_args.json` con una receta por defecto (RMSProp con schedule polinómico) que el autor describe como valores de partida del script, no como evidencia de una ejecución completada. No se documentan tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o ajuste por preferencias. El autor tampoco reclama ninguna puntuación de benchmark y recomienda que cualquier evaluación futura se haga sobre un split etiquetado específico de la tarea, con al menos tres semillas y una línea base de capacidad comparable.

## Capacidades

- Clasificación de datos mediante una arquitectura híbrida CNN-Transformer; es la única capacidad declarada en la model card.
- Procesamiento con atención lineal y fusión Tucker como innovación arquitectónica del bloque de combinación.
- Carga de pesos en formato safetensors para inicialización y pruebas de humo.
- Ejecución de un punto de entrada de entrenamiento/ejemplo mediante `finetune.py` (el bloque `__main__` contiene un ejemplo de smoke test autogenerado).
- No dispone de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades especiales (modo thinking, visión, audio, decodificación especulativa).

## Casos de uso

- Investigación en arquitecturas híbridas CNN-Transformer: el repositorio permite reproducir la combinación de convoluciones, atención lineal y fusión Tucker, y modificarla para estudiar su comportamiento en tareas de clasificación.
- Pruebas de humo en pipelines de CI/CD: al ser un checkpoint de inicialización de 33.088 parámetros y 0,0 GB, se puede descargar e instanciar en segundos para verificar que el código de carga de safetensors y los adaptadores personalizados funcionan antes de usar modelos mayores.
- Línea base de comparación en experimentos de clasificación: el autor propone explícitamente evaluar con un split etiquetado específico, al menos tres semillas y una línea base de capacidad comparable, por lo que este repositorio puede actuar como punto de partida metodológico.
- Docencia y formación: sirve como ejemplo mínimo y legible de fusión Tucker, atención lineal y normalización layernorm dentro de un pipeline de clasificación en PyTorch.
- Ablación de hiperparámetros de optimización: la receta RMSProp con schedule polinómico incluida en `training_args.json` puede usarse como configuración inicial en estudios de sensibilidad de optimizador y scheduler.
- Adaptación a dominios concretos mediante fine-tuning: al tratarse de un checkpoint sin entrenar, es un punto de partida para ajustar sobre un conjunto etiquetado propio (por ejemplo, clasificación de señales o imágenes de baja resolución), siempre que se documente por separado cualquier resultado obtenido.
- Verificación de integración con APIs de carga personalizadas: la model card advierte de que, al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito, lo que convierte al repositorio en un caso de prueba útil para ese tipo de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que no se reclama ninguna puntuación de benchmark y que el checkpoint incluido no ha sido entrenado ni auditado.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| Métricas de clasificación (accuracy, F1, etc.) | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 33.088 parámetros, los pesos en precisión de 32 bits ocupan aproximadamente 0,13 MB; en float16, aproximadamente 0,07 MB (estimación orientativa a partir del recuento de parámetros).
- GPU recomendadas: no se requiere GPU. El modelo cabe con holgura en cualquier GPU consumer, incluida una GTX 1050 o integradas, y también en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en hardware sin aceleración dedicada.
- Opciones de despliegue: PyTorch mediante el script `finetune.py` incluido en el repositorio y un adaptador explícito, ya que la model card advierte de que las APIs genéricas de carga automática no funcionan sin él. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y al no ser un modelo generativo no son opciones aplicables por defecto.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones y dependerían por completo del clasificador y del tamaño de entrada que se definan durante el entrenamiento.

## Comparativa con modelos similares

La información disponible no incluye comparativas ni resultados que permitan situar este modelo frente a alternativas. La tabla siguiente recoge alternativas de la misma categoría (clasificación con arquitecturas convolucionales o Transformer), con datos de referencia generales y no procedentes de la información proporcionada, por lo que deben tratarse como orientativos.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wphillipsman/cnn-transformer-classification | Hibrido CNN-Transformer, atencion lineal, fusion Tucker | 33.088 (dato verificado) | No aplica | BSD-3-Clause | HuggingFace, pesos sin entrenar |
| ResNet-50 | CNN pura | Aprox. 25,6 M (referencia general) | No aplica | Varía segun implementacion | Amplia, con pesos preentrenados |
| ViT-Base | Transformer puro de vision | Aprox. 86 M (referencia general) | No aplica | Varía segun implementacion | Amplia, con pesos preentrenados |
| ConvNeXt-Tiny | CNN moderna | Aprox. 28,6 M (referencia general) | No aplica | Varía segun implementacion | Amplia, con pesos preentrenados |

La diferencia fundamental no es de rendimiento, sino de estado: las alternativas citadas se distribuyen habitualmente con pesos entrenados y métricas publicadas, mientras que este repositorio contiene únicamente una inicialización experimental. No se dispone de datos que permitan comparar rendimiento, contexto o licencia en igualdad de condiciones.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado. Cualquier uso directo producirá salidas sin valor predictivo.
- No se ha auditado el modelo en cuanto a robustez, equidad ni transferencia de dominio, tal como reconoce el propio autor.
- No hay resultados de benchmarks ni métricas publicadas; no es posible estimar su calidad.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de interpretar como válidas las salidas de un modelo sin entrenar.
- No se documentan idiomas soportados ni capacidades multilingües.
- No se documenta longitud de contexto; al ser un clasificador, esta noción no aplica de forma directa.
- Licencia BSD-3-Clause: permite uso comercial y modificación con conservación del aviso de copyright y exención de responsabilidad, pero debe revisarse por separado la licencia de los datos de origen si se usa con conjuntos externos, tal como advierte la model card.
- Implementación personalizada: requiere un adaptador explícito para las APIs genéricas de carga automática; no se puede usar como un modelo estándar de HuggingFace sin trabajo adicional.
- Entorno de producción: no recomendado sin un ciclo completo de entrenamiento, evaluación sobre split etiquetado, múltiples semillas y una línea base de capacidad comparable.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Wphillipsman/cnn-transformer-classification
- Repositorio de código: no disponible (el autor referencia `finetune.py` dentro del propio repositorio de HuggingFace)
- Paper: no disponible
- Blog o documentación adicional: no disponible
- Demo: no disponible

Nota: los resultados de la búsqueda web realizada no guardan relación con el modelo (contenido sobre baterías de estado sólido para vehículos eléctricos) y no se han utilizado como fuente.
