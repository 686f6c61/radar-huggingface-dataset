# tahaz122/cnn-autoencoder

## Resumen

Industrial Sense AI es un framework de inspeccion visual no supervisada publicado en HuggingFace por el usuario tahaz122 bajo el identificador `tahaz122/cnn-autoencoder`. No es un modelo de lenguaje: se trata de un autoencoder convolucional entrenado con PyTorch para detectar y localizar defectos de fabricacion en imagenes de componentes industriales de alta resolucion, tomando como referencia el dataset MVTec AD. El sistema combina el modelo con una aplicacion Gradio que permite subir imagenes, ajustar el umbral de decision en caliente y visualizar mapas de calor de anomalia.

El nucleo tecnico es un autoencoder con cuatro etapas de encoder convolucional que comprimen la imagen hasta un vector de cuello de botella de 128 dimensiones, seguido de cuatro etapas de decoder con convoluciones transpuestas. La deteccion se basa en el error de reconstruccion: el modelo solo aprende la apariencia de piezas correctas, de modo que las regiones defectuosas producen un error L1 elevado que se suaviza con un filtro gaussiano y se superpone sobre la imagen original con la paleta `JET`. Incluye ademas diagnosticos ECDF para comparar las distribuciones de error de pixeles normales frente a defectuosos.

Su relevancia es la de un proyecto de referencia reproducible para inspeccion industrial sin etiquetas: elimina la necesidad de anotar defectos, que es precisamente el cuello de botella en entornos de fabricacion. Ahora bien, la ficha publica llega sin pesos, sin recuento de parametros, sin resultados de benchmarks y sin detalles de entrenamiento, y el propio `.gitignore` del proyecto excluye los binarios pesados, por lo que a dia de hoy el artefacto es fundamentalmente codigo y descripcion, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional: 4 etapas de encoder convolucional, cuello de botella de 128 dimensiones, 4 etapas de decoder con convoluciones transpuestas |
| Parametros totales | no disponible (el autor no publica recuento y los pesos no se distribuyen) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no se especifica la resolucion de entrada soportada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | MIT segun la model card del autor; el metadato de HuggingFace figura como no disponible |
| Formato de pesos | no disponible; la documentacion menciona un checkpoint PyTorch `autoencoder_mvtec.pth` que no acompana al repositorio |
| Framework | PyTorch (Python 3.8+), interfaz Gradio |
| Tarea | Deteccion de anomalias no supervisada con localizacion a nivel de pixel |
| Dataset de referencia | MVTec AD |
| Metodo de puntuacion | Distancia de reconstruccion L1, suavizado gaussiano y umbral configurable |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion en HuggingFace | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder completamente convolucional y simetrico. El encoder aplica cuatro etapas de convolucion que reducen progresivamente la resolucion espacial mientras aumentan el numero de canales, hasta comprimir la representacion en un vector de 128 dimensiones. El decoder invierte el proceso con cuatro etapas de convolucion transpuesta que reconstruyen la imagen de entrada. El entrenamiento es no supervisado en el sentido estricto del termino: la funcion de perdida se calcula unicamente sobre imagenes sin defectos, de modo que el modelo aprende la variedad normal de la clase de producto y falla al reconstruir cualquier desviacion. La model card menciona el uso de Anomalib en el script de entrenamiento (`code/datascience_project.py`), aunque no detalla si se emplea como framework de orquestacion, como proveedor del dataset o como referencia de metricas.

La inferencia genera un mapa de error pixel a pixel mediante distancia L1 entre la entrada y la reconstruccion, lo aplica un suavizado gaussiano para reducir ruido de alta frecuencia y lo colorea con la paleta `JET` antes de superponerlo. El diagnostico ECDF compara la distribucion acumulada de errores de pixeles normales frente a defectuosos, lo que sirve para justificar la eleccion del umbral de decision, ajustable en la interfaz Gradio. No se especifican en la informacion disponible el numero de epocas, la tasa de aprendizaje, las tecnicas de aumento de datos, la resolucion de entrenamiento, el tamano del conjunto normal por categoria ni el uso de validacion cruzada.

## Capacidades

- Deteccion de anomalias no supervisada: identifica defectos sin haber visto ejemplos defectuosos durante el entrenamiento, apoyandose en el error de reconstruccion.
- Localizacion a nivel de pixel: genera un mapa de error espacial que senala que region concreta de la pieza es anomala, no solo una etiqueta global.
- Visualizacion interpretable: superpone mapas de calor con paleta `JET` sobre la imagen de entrada para inspeccion humana.
- Umbral de decision ajustable: permite modificar el punto de corte entre normal y defectuoso de forma dinamica en la interfaz.
- Diagnostico estadistico: curvas ECDF y graficos comparativos de distribuciones de error normal frente a defectuoso.
- Interfaz web lista para usar: aplicacion Gradio que admite carga de imagenes y seleccion de muestras del dataset.
- Exportacion a HuggingFace Spaces: el proyecto documenta el despliegue con SDK Gradio.
- Entrenamiento reproducible: scripts de PyTorch y cuaderno de Google Colab para reentrenar sobre datos propios.
- No soporta: generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling, agentes, capacidades multilingues, vision-lenguaje, audio ni modo de razonamiento explicito.

## Casos de uso

- Control de calidad en linea de fabricacion: el autoencoder se entrena con imagenes de piezas correctas de una referencia concreta y marca en tiempo real aquellas cuya reconstruccion supera el umbral; al no requerir ejemplos defectuosos, encaja en lineas donde los defectos son raros o desconocidos de antemano.
- Inspeccion de componentes metalicos y mecanicos: las categorias tipo tornillo, tuerca o metal de MVTec AD son directamente aplicables; el mapa de calor permite al operario ver si el defecto esta en la rosca, el cuerpo o la cabeza.
- Verificacion de placas de circuito impreso: deteccion de soldaduras frias, componentes ausentes o desplazados mediante el error de reconstruccion localizado en la zona afectada.
- Inspeccion textil e industrial: identificacion de roturas, manchas o defectos de tejido en imagenes de alta resolucion, con el diagnostico ECDF para calibrar el umbral segun la tolerancia de la planta.
- Prototipado e investigacion en deteccion de anomalias: sirve como linea base reproducible sobre MVTec AD para comparar con metodos de embedding de caracteristicas o de tipo student-teacher dentro del ecosistema Anomalib.
- Precribado de imagenes en laboratorios de metrologia: uso del sistema como primer filtro que descarta piezas claramente correctas y deriva al inspector humano solo las dudosas, reduciendo carga de revision.
- Docencia y formacion tecnica: el par script de entrenamiento mas aplicacion Gradio permite explicar de forma practica el ciclo completo de un autoencoder, desde la perdida de reconstruccion hasta el despliegue de una demo interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la existencia de diagnosticos ECDF y de comparaciones entre distribuciones de error normal y defectuoso, pero no incluye cifras de AUROC, PRO, precision, recall ni F1 sobre MVTec AD ni sobre ningun otro conjunto.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al no publicarse el recuento de parametros ni la resolucion de entrada, no es posible dar una cifra exacta. Estimacion orientativa no confirmada por el autor: un autoencoder convolucional con cuello de botella de 128 dimensiones es una red pequena y cabe con holgura en GPUs de gama media, pero se trata de una inferencia, no de un dato publicado.
- GPU recomendadas: no disponibles. Cualquier GPU con soporte CUDA para PyTorch es suficiente en principio; el repositorio no especifica minimos.
- GPU de consumo: no confirmado. Por la naturaleza de la arquitectura es probable que quepa en tarjetas de gama de consumo recientes, pero el autor no lo documenta.
- CPU: PyTorch permite ejecutar el modelo en CPU, aunque no se publican tiempos de inferencia en ese modo.
- Opciones de despliegue: la unica documentada es la aplicacion Gradio (`app.py`) y el despliegue como HuggingFace Space con SDK Gradio. Tambien es posible ejecutar directamente el script de PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, herramientas orientadas a modelos de lenguaje y no aplicables a este tipo de red.
- Latencia y throughput: no disponibles.
- Requisito previo: el checkpoint entrenado (`autoencoder_mvtec.pth`) debe colocarse manualmente en el directorio raiz antes de lanzar la aplicacion; no se distribuye con el repositorio.

## Comparativa con modelos similares

No se dispone de cifras verificables de este modelo, y la busqueda web realizada no aporto informacion util (los resultados devueltos no guardan relacion con el proyecto). La comparacion siguiente se limita a enfoques de categoria equivalente en deteccion de anomalias visuales no supervisadas y debe tomarse como orientativa; los datos numericos de cada alternativa no se han verificado a partir de la informacion proporcionada.

| Modelo o metodo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahaz122/cnn-autoencoder` | Autoencoder convolucional, error de reconstruccion L1 | no disponible | no aplica (imagen) | MIT segun model card | Codigo y descripcion; sin pesos publicados |
| PatchCore | Banco de memoria de caracteristicas preentrenadas con muestreo de nucleo | no disponible en la informacion | no aplica (imagen) | no disponible en la informacion | Disponible en el ecosistema Anomalib |
| PaDiM | Modelo gaussiano multivariante sobre caracteristicas preentrenadas por parche | no disponible en la informacion | no aplica (imagen) | no disponible en la informacion | Disponible en el ecosistema Anomalib |
| EfficientAD | Esquema student-teacher con destilacion de caracteristicas | no disponible en la informacion | no aplica (imagen) | no disponible en la informacion | Disponible en el ecosistema Anomalib |

La diferencia conceptual principal es que este proyecto reconstruye la imagen completa con un autoencoder entrenado desde cero, mientras que los metodos citados reutilizan caracteristicas de redes preentrenadas. No hay datos publicados que permitan afirmar cual rinde mejor en este caso concreto.

## Limitaciones y advertencias

- Ausencia de pesos: el repositorio excluye explicitamente los binarios y el checkpoint debe entrenarse por cuenta propia; no hay un artefacto listo para usar.
- Ausencia de benchmarks: no hay AUROC, PRO ni ninguna metrica publicada, por lo que no es posible evaluar su precision real ni compararla con alternativas.
- Opacidad del entrenamiento: no se documentan epocas, tasa de aprendizaje, aumentos de datos, resolucion de entrada ni numero de imagenes normales por categoria.
- Licencia ambigua: la model card declara MIT, pero el metadato de HuggingFace figura como no disponible y no se incluye fecha ni titular de copyright, lo que conviene aclarar antes de un uso comercial.
- Reentrenamiento obligatorio por dominio: un autoencoder de reconstruccion pierde validez al cambiar el producto, la optica, la iluminacion o el fondo; cada nueva referencia exige recopilar imagenes normales y reentrenar.
- Sensibilidad al umbral: la decision depende de un punto de corte ajustado a mano; un umbral mal calibrado produce falsos positivos que paralizan linea o falsos negativos que dejan pasar defectos.
- Sesgo de dominio: el modelo aprende exclusivamente la variabilidad presente en el conjunto normal de entrenamiento; si ese conjunto no cubre toda la variacion legitima (reflejos, orientaciones, desgaste de utillaje), apareceran falsas alarmas.
- Defectos logicos no detectables: al ser puramente reconstructivo, no detecta errores de montaje que no alteren la apariencia local, como piezas correctas colocadas en la posicion equivocada.
- Riesgo de reconstruccion excesiva: si el cuello de botella de 128 dimensiones es demasiado expresivo para la tarea, el modelo puede reconstruir tambien defectos y reducir la sensibilidad.
- Sin informacion sobre sesgos eticos ni sobre el autor: no hay afiliacion, publicacion asociada ni proceso de revision descrito.
- Resultados de la busqueda web no utilizables: la busqueda asociada devolvio exclusivamente resultados de contenido para adultos sin ninguna relacion con el modelo, por lo que no aportan enlaces ni datos tecnicos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tahaz122/cnn-autoencoder
- Repositorio GitHub: la model card referencia un repositorio con la URL plantilla `https://github.com/<your-username>/anomaly-detection`, sin usuario resuelto, por lo que el enlace no es accesible en su forma publicada.
- Dataset MVTec AD: mencionado en la model card como conjunto de referencia; no se incluye enlace directo.
- Anomalib: mencionado como framework en el script de entrenamiento; no se incluye enlace directo.
- Licencia MIT: referenciada como archivo `LICENSE` dentro del proyecto, no enlazada desde la pagina de HuggingFace.
- Busqueda web complementaria: sin resultados relevantes; los enlaces devueltos correspondian a sitios de contenido para adultos y se han descartado.
