# vietserve/lumawb

## Resumen

Lumawb es un modelo de visión por computador publicado por el usuario vietserve en HuggingFace, distribuido en formato ONNX y especializado en una tarea muy concreta: predecir los 42 ajustes de Adobe Camera Raw (balance de blancos, tono, presencia, detalle y mezclador de color) que un fotógrafo aplicaría manualmente a una imagen. No es un modelo de lenguaje: no genera texto, no razona y no procesa instrucciones. Su única salida es un vector de 42 valores normalizados que un revelador compatible con Camera Raw puede aplicar a la imagen a resolución completa.

El modelo toma como entrada un tensor float32 de dimensiones `[1, 3, 448, 448]` en RGB normalizado a `[0, 1]`, y devuelve un tensor float32 `[1, 42]`. Se distribuye como un único fichero `lumawb.onnx` de 5,1 MB (opset 17), acompañado de un `config.json` con la firma de entrada/salida y los rangos de cada ajuste, un fichero de sumas de comprobación y un script de inferencia en Python. El backbone está adaptado de HAT (Apache-2.0), una red de restauración de imagen.

Su relevancia es acotada pero clara: automatiza el primer paso del revelado fotográfico (obtener una base de ajustes globales) con un coste computacional mínimo, ya que funciona en CPU con latencias de 3,3 a 7,3 segundos por imagen. La contrapartida es una licencia `all-rights-reserved` que solo permite visualización y evaluación, sin derecho de uso, modificación ni redistribución, y la ausencia total de métricas de precisión publicadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone adaptado de HAT (Apache-2.0); arquitectura interna exacta no disponible |
| Parametros totales | no disponible (solo se publica un fichero ONNX de 5,1 MB; no se declara el recuento de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; la entrada es una imagen de 448 x 448) |
| Tipos de cuantizacion | no disponible (se distribuye una única variante ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (la entrada es una imagen, no texto) |
| Licencia | `other` / `all-rights-reserved`; uso limitado a visualización y evaluación |
| Formato de pesos | ONNX, opset 17 (`lumawb.onnx`, 5,1 MB); el modelo card menciona también un modelo PyTorch de referencia |
| Entrada | `image`: float32 `[1, 3, 448, 448]`, RGB en `[0, 1]` |
| Salida | `acr`: float32 `[1, 42]`, normalizado |
| Numero de ajustes predichos | 42 (balance de blancos, tono, presencia, detalle y mezclador de color) |
| Preprocesado obligatorio | Rotación según EXIF y redimensionado con `cv2.INTER_CUBIC` |
| Runtime medido | ONNX Runtime 1.31 |
| Tamano del repositorio | 0,0 GB según HuggingFace (el fichero de modelo ocupa 5,1 MB) |
| SHA-256 de `lumawb.onnx` | `d84ac8d42752428d46b8d67ccc6f4113f184d6ec1c2ddba419b13650f840361e` |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La model card indica únicamente que el backbone está adaptado de HAT, un modelo de restauración de imagen del proyecto XPixelGroup publicado bajo Apache-2.0. No se detalla el número de capas, la dimensión de los embeddings, el tipo de atención ni la configuración exacta de la red. El modelo se exportó a ONNX con opset 17 y se validó contra la implementación de referencia en PyTorch: la salida ONNX coincide con la de PyTorch dentro de un margen de 3,1e-4 antes del redondeo, y los valores finales de Camera Raw resultaron idénticos en todas las imágenes de prueba.

El entrenamiento se realizó sobre un conjunto de datos privado de fotografías editadas por personas, es decir, pares imagen original / ajustes aplicados. El autor afirma que tanto el dataset como el trabajo de entrenamiento se publicarán más adelante, pero no se indica el número de imágenes, la composición del conjunto, la distribución de cámaras o estilos, ni si hubo fases de refinamiento posteriores. Tampoco se documenta la función de pérdida ni el régimen de aumento de datos. Esta falta de información impide reproducir el entrenamiento o auditar la procedencia de los datos.

La innovación funcional del modelo no está en la arquitectura, sino en la formulación de la tarea: transformar un problema de edición subjetiva en una regresión de 42 escalares con rangos documentados, de modo que la salida sea directamente aplicable por un revelador Camera Raw sin ningún paso de interpretación por parte de un modelo de lenguaje.

## Capacidades

- Predicción de 42 ajustes globales de Adobe Camera Raw a partir de una fotografía: temperatura incremental, matiz, exposición, ajustes de tono, presencia y mezclador de color.
- Estimación de balance de blancos automático (temperatura y matiz) sin necesidad de referencia de color.
- Análisis global de la apariencia de una imagen a partir de una copia reducida de 448 x 448 píxeles.
- Inferencia determinista en CPU, sin dependencia de GPU.
- Exportación a ONNX con paridad numérica verificada frente a PyTorch (3,1e-4 antes de redondeo).
- Conversión de la salida normalizada a valores de Camera Raw mediante `config.json`, que define el orden de los 42 ajustes y sus rangos.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: no procesa instrucciones ni genera lenguaje.
- No realiza ajustes locales: no predice máscaras, curvas ni correcciones por zonas.

## Casos de uso

- Revelado por lotes con revisión humana: aplicar la predicción como punto de partida sobre cientos de fotografías de un reportaje y dejar que el fotógrafo ajuste solo los casos dudosos. El coste de 3,3 s por imagen en un Ryzen 9 7950X3D hace viable procesar un reportaje completo en una sola máquina sin GPU.
- Sugerencia automática de ajustes en aplicaciones de edición: al abrir una foto, la aplicación muestra los valores predichos como preset inicial. El modelo devuelve directamente las claves que el revelador espera, sin capa de traducción intermedia.
- Normalización de estilo en catálogos: si un archivo fotográfico debe tener una apariencia homogénea, el modelo aporta una base consistente de balance de blancos y tono, y el desviador humano solo corrige excepciones.
- Generación de presets de partida: usar el vector de 42 valores como semilla para construir presets reutilizables por tipo de escena o de iluminación.
- Clasificación y triaje previo a publicación web: estimar exposición y balance de blancos para descartar o recolocar imágenes antes de que pasen por el editor.
- Etiquetado de conjuntos de datos de edición: generar valores de referencia para pares foto-ajuste que después se revisan manualmente, acelerando la anotación.
- Integración en servicios de laboratorio o impresión: calcular ajustes globales de normalización antes del render final, con la ventaja de que el modelo corre en el mismo servidor sin acelerador.
- Uso didáctico: mostrar qué ajustes globales propone un modelo entrenado con ediciones humanas y compararlos con los que aplica un estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión en la información disponible. La model card no incluye métricas de error sobre los 42 ajustes (MAE, RMSE ni exactitud por ajuste) ni comparaciones cuantitativas con otros modelos de revelado automático.

Los únicos datos de rendimiento publicados son de latencia de inferencia, medidos en CPU con dos hilos y ONNX Runtime 1.31:

| CPU | PyTorch | ONNX |
|---|---:|---:|
| AMD Ryzen 9 7950X3D | 6,5 s | 3,3 s |
| Apple M1 Pro (Docker, ARM64) | 7,6 s | 7,3 s |

La exportación a ONNX reduce el tiempo de inferencia aproximadamente a la mitad en el Ryzen 9 7950X3D, mientras que en el M1 Pro la mejora es marginal (0,3 s). No hay datos publicados de throughput en GPU ni de latencia con procesamiento por lotes.

## Requisitos de hardware

- VRAM: no aplica en el modo documentado. La inferencia está medida en CPU; el fichero de modelo ocupa 5,1 MB, por lo que el consumo de memoria es de unos pocos cientos de MB contando el runtime.
- GPU recomendadas: no disponible. La model card no documenta ejecución en GPU ni versiones de `onnxruntime-gpu`.
- GPU de consumo: no es necesario. Cabe en cualquier equipo capaz de ejecutar ONNX Runtime, incluidos portátiles sin GPU dedicada.
- CPU de referencia: AMD Ryzen 9 7950X3D (3,3 s por imagen) y Apple M1 Pro en Docker ARM64 (7,3 s por imagen), ambos con dos hilos.
- Opciones de despliegue: ONNX Runtime (CPU). vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje y este modelo procesa imágenes.
- Dependencias declaradas: `onnxruntime`, `numpy`, `pillow` y `opencv-python-headless`.
- Latencia: 3,3 s por imagen en Ryzen 9 7950X3D y 7,3 s en M1 Pro. No hay datos de throughput por lotes ni de latencia en GPU.
- Restricción de preprocesado: el redimensionado debe hacerse con `cv2.INTER_CUBIC` tras aplicar la rotación EXIF; cualquier otro método altera los resultados.

## Comparativa con modelos similares

No se han proporcionado alternativas comparables en la información disponible. La model card no incluye ninguna comparación con otros modelos de revelado automático o de predicción de ajustes de Camera Raw, y los resultados de búsqueda web facilitados no guardan relación con el modelo.

El único punto de referencia documentado es HAT, del que procede el backbone, pero no es una alternativa funcional: HAT resuelve tareas de restauración de imagen, no de predicción de ajustes.

| Modelo | Tarea | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumawb | Predicción de 42 ajustes de Camera Raw | no disponible | no aplica (imagen 448 x 448) | `all-rights-reserved` | ONNX, 5,1 MB, en HuggingFace |
| HAT (XPixelGroup) | Restauración de imagen | no disponible | no aplica | Apache-2.0 | Repositorio público en GitHub |

Se concluye que no hay datos suficientes para establecer una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia muy restrictiva: el modelo se comparte únicamente para visualización y evaluación. No se concede licencia para usarlo, modificarlo ni redistribuirlo, lo que excluye cualquier uso comercial sin autorización expresa de los autores. La licencia de HuggingFace figura como `other` con nombre `all-rights-reserved`.
- Alcance reducido de la predicción: solo se predicen ajustes globales. No hay máscaras, curvas ni ajustes locales, por lo que no sirve para ediciones selectivas por zonas o por sujeto.
- Pérdida de detalle por resolución: el modelo analiza una copia de 448 x 448 píxeles, de modo que juzga la apariencia global y no el detalle fino. En imágenes con dominantes locales o fuentes de luz mixtas la estimación de balance de blancos puede ser una aproximación gruesa.
- Dependencia estricta del preprocesado: el redimensionado bicúbico de OpenCV forma parte del contrato de entrada. Cualquier otro método de remuestreo cambia los resultados.
- Diferencias de redondeo: los valores que caen exactamente en un escalón de redondeo pueden diferir en un paso entre distintas CPU o runtimes. En un flujo productivo esto puede generar inconsistencias entre máquinas.
- Dataset de entrenamiento no publicado: el conjunto de fotografías editadas por personas es privado y se anuncia su publicación futura, sin fecha. No es posible auditar sesgos de estilo, cobertura de cámaras ni distribución de escenas. Es previsible que el modelo reproduzca el criterio de edición de los fotógrafos que generaron los datos.
- Ausencia de métricas de calidad: no hay MAE, RMSE ni ningún indicador de acierto por ajuste, ni validación en un conjunto de prueba público. Tampoco hay validación por parte de la comunidad: 0 descargas y 1 like.
- Riesgo de predicciones implausibles fuera de distribución: ante imágenes muy alejadas del conjunto de entrenamiento (infrarrojos, microscopía, capturas sintéticas), el modelo puede devolver combinaciones de ajustes incoherentes sin ninguna señal de confianza asociada.
- Advertencia de marca: Adobe y Camera Raw son marcas de Adobe Inc. Lumawb no está afiliado a Adobe.
- Inferencia en CPU sin optimización documentada: no hay soporte declarado para GPU, cuantización ni lotes, lo que limita el escalado en entornos de alto volumen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vietserve/lumawb
- HAT (backbone de origen, XPixelGroup, Apache-2.0): https://github.com/XPixelGroup/HAT
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relacionado con el modelo, su autor ni la edición fotográfica; corresponden a páginas del ayuntamiento de Burdeos y se han descartado por no ser relevantes.
