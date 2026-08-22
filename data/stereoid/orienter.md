# stereoid/Orienter

## Resumen

Orienter es un sistema de detección de elementos gráficos interactuables en capturas de realidad extendida (XR), desarrollado por el autor stereoid y publicado como código oficial del artículo "Look Before You Leap: Context-Sensitive GUI Grounding for Boosting Automated Extended Reality (XR) Testing" (DOI 10.1145/3808134). El modelo resuelve el problema de localizar con precisión botones, menús y otros componentes de interfaz en imágenes de entornos XR, donde el contexto de la aplicación es esencial para distinguir elementos interactuables de elementos meramente visuales.

El pipeline público consta de tres etapas: un modelo de lenguaje multimodal (LMM) combina el contexto de la aplicación con la captura actual para generar descripciones de elementos interactuables; un detector de objetos denominado APE-L_D (basado en APE y Grounding DINO) localiza esas descripciones en la imagen; y un conjunto de herramientas de evaluación convierte, fusiona, filtra y puntúa las predicciones. El checkpoint principal del detector está incluido en el repositorio (6 GB), aunque el LMM se invoca externamente a través de OpenRouter, con perfiles para GPT-4o, Claude 3.5 Sonnet y Gemini 1.5 Pro.

La relevancia actual de Orienter radica en su enfoque sensible al contexto para el grounding de GUI en XR, un área poco cubierta por los detectores de objetos genéricos. Su publicación en PACMSE (Volume 3, Issue FSE) y la disponibilidad del código y el checkpoint lo convierten en una referencia útil para investigadores y desarrolladores que trabajan en testing automatizado de interfaces XR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | APE-L_D (basado en APE y Grounding DINO) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el pipeline usa LMMs externos que soportan ingles) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (.pth) |

## Arquitectura y entrenamiento

Orienter no es un modelo unico, sino un pipeline de tres etapas. La etapa de deteccion (la que aporta el checkpoint APE-L_D) se basa en APE (Adaptive Prompting for Efficient object detection) y Grounding DINO, un detector de objetos abierto que puede localizar cualquier objeto descrito en lenguaje natural. El checkpoint `ape_d_model_final.pth` se encuentra en `approach/ovod/APE/` y requiere un entorno CUDA/PyTorch para su compilacion e inferencia.

La primera etapa del pipeline utiliza un LMM (por defecto `openai/gpt-5.6-sol` via OpenRouter, con perfiles alternativos para GPT-4o, Claude 3.5 Sonnet y Gemini 1.5 Pro) que recibe el contexto de la aplicacion y la captura de pantalla para generar descripciones de los elementos interactuables. La segunda etapa ejecuta APE-L_D para grounding de esas descripciones, con un bucle de reflexion opcional (PII.5-PII.7) descrito en el articulo. La tercera etapa incluye herramientas de evaluacion para deteccion, semantica, contexto e interaccion.

No se han publicado detalles sobre el entrenamiento de APE-L_D: ni numero de tokens, ni composicion del dataset, ni si se uso RLHF o DPO. El repositorio excluye deliberadamente los datos de imagen, credenciales, logs y resultados experimentales. La innovacion principal es el uso de contexto de la aplicacion para guiar la deteccion, en lugar de depender solo de la imagen.

## Capacidades

- Deteccion de elementos GUI interactuables (botones, menus, campos de texto) en capturas de realidad extendida.
- Grounding de descripciones en lenguaje natural: dado un texto que describe un elemento, el modelo localiza su bounding box en la imagen.
- Integracion con LMMs externos para la mineria automatica de descripciones de elementos a partir del contexto de la aplicacion.
- Bucle de reflexion opcional (PII.5-PII.7) que permite refinar las predicciones mediante un asesor externo.
- Evaluacion multidimensional: deteccion, semantica, contexto e interaccion, con herramientas de conversion y fusion de predicciones.
- Soporte para multiples proveedores de LMM via OpenRouter (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro) mediante perfiles configurables.

## Casos de uso

- Testing automatizado de aplicaciones XR: el pipeline puede generar y verificar automaticamente que los elementos interactuables de una interfaz XR estan presentes y correctamente posicionados, reduciendo el esfuerzo manual de los equipos de QA.
- Verificacion de regresiones visuales en actualizaciones de UI: al comparar capturas de distintas versiones, Orienter puede detectar si un boton o menu ha cambiado de posicion o ha desaparecido, ayudando a identificar regresiones introducidas por cambios de codigo.
- Auditoria de accesibilidad en entornos XR: el modelo puede localizar elementos interactuables y comprobar si cumplen tamanos minimos o estan correctamente etiquetados, facilitando la evaluacion de pautas de accesibilidad.
- Generacion de datos de entrenamiento para otros modelos: las predicciones de Orienter pueden usarse como pseudo-etiquetas para entrenar detectores de GUI mas ligeros o especificos de un dominio.
- Investigacion en grounding visual sensible al contexto: el pipeline sirve como base para estudiar como el contexto de la aplicacion mejora la precision de la deteccion de elementos de interfaz, con utilidad en entornos de investigacion academica.
- Automatizacion de flujos de interaccion en XR: combinado con un agente que ejecuta acciones, Orienter puede localizar el elemento a pulsar o arrastrar, permitiendo la automatizacion de tareas complejas en simuladores XR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio menciona que los resultados historicos de experimentos y las tablas de validacion no estan incluidos en la copia publica, y que la reproduccion a escala de paper requiere assets externos (dataset, acceso a proveedor y entorno CUDA/APE validado).

## Requisitos de hardware

- El checkpoint APE-L_D ocupa aproximadamente 6 GB en disco, lo que sugiere que la inferencia requiere una GPU con al menos 8-12 GB de VRAM, aunque no se especifica el consumo exacto.
- Se requiere un entorno CUDA/PyTorch para compilar e instalar la extension de APE antes de ejecutar la etapa 2. No se indican versiones concretas de CUDA ni GPUs recomendadas.
- La etapa 1 (LMM) se ejecuta via API en la nube (OpenRouter), por lo que no consume VRAM local, pero requiere conexion a internet y credenciales de acceso.
- Para el pipeline completo en local, se recomienda una GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3090, RTX 4090, A100 o similar), aunque no se proporcionan mediciones de latencia ni throughput.
- Opciones de despliegue: el codigo esta pensado para ejecutarse como scripts de Python (run_vlm.py, run_ape.py), no como servicio. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No se han identificado modelos publicados con la misma especializacion (deteccion de GUI en XR sensible al contexto) en la informacion proporcionada. Los detectores genericos de objetos como Grounding DINO o YOLO-World podrian servir como referencia, pero no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- La licencia del modelo no esta especificada, lo que impide conocer las restricciones de uso comercial o modificacion. Se recomienda contactar al autor antes de usarlo en produccion.
- El pipeline depende de un LMM externo de pago (OpenRouter) para la generacion de descripciones, lo que introduce costes por inferencia y dependencia de la disponibilidad del proveedor.
- El repositorio excluye los datos de imagen del dataset, las credenciales, los logs y los resultados experimentales, por lo que la reproduccion completa del paper requiere assets externos no publicados.
- No se han publicado metricas de rendimiento ni benchmarks, por lo que se desconoce la precision real del detector en escenarios distintos a los del articulo.
- El modelo esta orientado a capturas XR; su rendimiento en imagenes de GUI tradicionales (2D) no esta validado.
- La etapa de reflexion (PII.5-PII.7) requiere un LMM adicional, lo que aumenta la latencia y el coste del pipeline.
- No se proporcionan garantias de seguridad ni de robustez frente a entradas adversariales; el uso en entornos criticos debe evaluarse con datos propios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/stereoid/Orienter
- Paper (DOI): https://doi.org/10.1145/3808134
- Pagina del proyecto: https://sites.google.com/view/gui-orienter
- Guia del pipeline (PIPELINE_README.md): disponible en el repositorio
- Documentacion de entorno (docs/ENVIRONMENT.md): disponible en el repositorio
- Manifiesto de assets (docs/ASSETS.md): disponible en el repositorio
- Manifiesto del modelo (docs/MODEL_MANIFEST.md): disponible en el repositorio
