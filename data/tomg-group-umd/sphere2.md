# tomg-group-umd/sphere2

## Resumen

Sphere2 es un checkpoint publicado en HuggingFace por tomg-group-umd, la organización del laboratorio de Tom Goldstein en la Universidad de Maryland (College Park). El repositorio se creó y actualizó el 4 de octubre de 2026, acumula 0 descargas y 0 likes, y su model card se limita a la declaración `license: mit`, sin descripción, ejemplos ni instrucciones de uso. En la fecha de esta ficha, la documentación publicada por el autor es prácticamente inexistente.

El nombre del repositorio coincide con el paper "Sphere Encoder 2" (arXiv:2610.02208v1), que describe checkpoints denominados "Sphere2-B" y evalúa la alineación de las estadísticas de características de las muestras generadas con las de imágenes reales mediante la métrica FDr, además de emplear una pérdida denominada `L_FD-lite`. Todo ello apunta a un modelo generativo de imágenes basado en un encoder sobre un espacio latente esférico, pero la información disponible no permite confirmar arquitectura, número de parámetros, datos de entrenamiento ni el resto de especificaciones habituales.

La relevancia del modelo, en el momento de redactar esta ficha, es principalmente potencial: procede de un laboratorio con producción previa en modelos abiertos para estudios de leyes de escala (la familia Gemstone, con modelos de 50M a 2B parámetros) y se distribuye bajo licencia MIT, lo que elimina las restricciones de uso comercial típicas de los generadores de imágenes más conocidos. Sin model card ni resultados publicados, cualquier evaluación seria exige descargar los pesos y reproducir el benchmark FDr por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paper asociado, "Sphere Encoder 2", sugiere un encoder generativo sobre espacio latente esferico; sin confirmar en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (el paper trabaja con generacion de imagenes, no con secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura con detalle. El unico material tecnico localizado es el paper "Sphere Encoder 2" (arXiv:2610.02208v1), que menciona checkpoints de la familia "Sphere2-B" y una perdida `L_FD-lite` cuyo efecto es alinear las estadisticas de caracteristicas de las muestras generadas con las de imagenes reales. El paper indica que se liberan checkpoints entrenados con y sin `L_FD-lite` para que terceros puedan medir FDr, y senala que las generaciones con y sin esa perdida son visualmente indistinguibles. No se especifican en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares.

Tampoco hay datos sobre innovaciones adicionales (decodificacion especulativa, atencion lineal, destilacion u otras). El contexto del laboratorio incluye investigacion en seguridad y privacidad de IA, sesgo algoritmico y fundamentos de machine learning, asi como la familia de modelos Gemstone para leyes de escala (50M a 2B parametros, 11 anchuras de 256 a 3072 y 18 profundidades de 3 a 80), pero no hay evidencia de que Sphere2 reutilice esa arquitectura.

## Capacidades

- Generacion de imagenes: es la unica capacidad que la informacion disponible permite inferir, a partir de la referencia a FDr y a la comparacion con estadisticas de imagenes reales en el paper asociado.
- Generacion de texto: no disponible, sin evidencia en la informacion proporcionada.
- Razonamiento, codigo y matematicas: no disponible, sin evidencia en la informacion proporcionada.
- Tool calling / function calling: no disponible, sin evidencia en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, sin evidencia en la informacion proporcionada.
- Capacidades multilingues: no disponible, sin evidencia en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible. Existen checkpoints "Sphere2-B" entrenados con y sin la perdida `L_FD-lite`, segun el paper, lo que constituye una variante de entrenamiento, no una capacidad adicional confirmada.

## Casos de uso

Advertencia previa: al no existir model card ni benchmarks publicados, los casos de uso siguientes son hipotesis razonadas a partir de la naturaleza aparentemente generativa de imagenes del modelo. Deben validarse con la descarga y evaluacion de los pesos antes de llevarlos a produccion.

- Generacion de imagenes sinteticas para aumento de datos: si el modelo produce muestras cuya estadistica de caracteristicas se alinea con la de imagenes reales, puede emplearse para ampliar datasets de entrenamiento en dominios con pocos ejemplos etiquetados, midiendo la ganancia con la metrica FDr del propio paper.
- Investigacion en leyes de escala y dinamica de entrenamiento: el laboratorio publica checkpoints con y sin `L_FD-lite`, lo que permite aislar el efecto de esa perdida en un mismo punto de entrenamiento y estudiar su impacto en la distribucion de caracteristicas.
- Edicion y sintesis de imagenes en entornos de investigacion academica: la licencia MIT facilita el uso en proyectos financiados con fondos publicos sin negociar licencias comerciales restrictivas, a diferencia de otros generadores de imagenes.
- Prototipado de pipelines generativos con requisitos de licencia laxa: equipos que necesiten integrar un generador de imagenes en un producto y no puedan asumir licencias no comerciales pueden evaluar este checkpoint como candidato, siempre que la evaluacion de calidad sea satisfactoria.
- Benchmarking de metricas de similitud distribucional: dado que el paper se apoya en FDr, el modelo sirve como sujeto de prueba para comparar metricas de distancia entre distribuciones de caracteristicas (FDr frente a FID y variantes).
- Reproducibilidad de resultados academicos: permite a otros grupos replicar las comparaciones del paper "Sphere Encoder 2" con los mismos checkpoints liberados por los autores.
- Analisis de sesgos y seguridad en modelos generativos: el laboratorio trabaja en sesgo algoritmico y seguridad, y los pesos abiertos permiten auditar sesgos de representacion en las muestras generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado menciona el uso de la metrica FDr y la comparacion visual entre generaciones con y sin `L_FD-lite` (descritas como visualmente indistinguibles), pero no se proporcionan valores numericos en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas generativas estandar (FID, FDr, IS) con cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin conocer el numero de parametros ni el tipo de arquitectura no es posible estimar requisitos de memoria.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible. El laboratorio ha publicado previamente modelos de hasta 2B parametros (familia Gemstone), pero no hay evidencia de que Sphere2 pertenezca a esa familia ni de su tamano.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. Estas herramientas estan orientadas a modelos de lenguaje; un generador de imagenes requeriria un runtime distinto, no especificado por el autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sphere2 (tomg-group-umd) | no disponible | no disponible | FDr (sin cifras publicadas en la informacion disponible) | MIT | Pesos en HuggingFace, sin model card |
| Familia Gemstone (mismo laboratorio) | 50M a 2B | no disponible | Leyes de escala | no disponible en la informacion proporcionada | HuggingFace |
| Generadores de imagenes con evaluacion FDr (p. ej. familia StyleGAN) | no disponible | no disponible | FDr / FID | habitualmente licencias no comerciales para pesos preentrenados | Publicos |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas concretas. La comparacion con la familia Gemstone solo es valida como referencia del mismo autor, no como equivalente funcional.

## Limitaciones y advertencias

- Ausencia total de model card: no hay documentacion de uso, limitaciones, datos de entrenamiento ni procedencia del dataset, lo que impide evaluar riesgos de sesgo y de memorizacion de datos de entrenamiento.
- Sesgos conocidos: no disponible. Al desconocerse la composicion del dataset, no puede descartarse sesgo de representacion en las muestras generadas.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; en generacion de imagenes el riesgo equivalente es la produccion de contenido plausible pero falso o no fotorrealista, cuya tasa no esta documentada.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Es una ventaja frente a generadores con pesos bajo licencias no comerciales.
- Caveat para produccion: el repositorio presenta 0 descargas y 0 likes y fue creado y actualizado el mismo dia, sin senales de validacion por parte de la comunidad. El paper asociado indica que las variantes con y sin `L_FD-lite` son visualmente indistinguibles, lo que cuestiona el beneficio practico de esa perdida en terminos de calidad percibida.
- Trazabilidad: la informacion disponible no confirma que el checkpoint del repositorio corresponda exactamente a los modelos "Sphere2-B" descritos en el paper, ni que version o tamano se ha subido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tomg-group-umd/sphere2
- Paper "Sphere Encoder 2": https://arxiv.org/html/2610.02208v1
- Colecciones del autor en HuggingFace: https://huggingface.co/tomg-group-umd/collections
- Publicaciones del autor en HuggingFace: https://huggingface.co/tomg-group-umd/papers
- Organizacion en GitHub: https://github.com/tomg-group-umd
- Pagina del grupo de investigacion: https://www.cs.umd.edu/~tomg/group/
