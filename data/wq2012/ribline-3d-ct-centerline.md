# wq2012/ribline-3d-ct-centerline

## Resumen

ribline-3d-ct-centerline es el paquete de checkpoints oficiales del proyecto **ribline** (v0.3.0), desarrollado por el usuario de Hugging Face `wq2012`. No es un modelo de lenguaje, sino un pipeline híbrido de aprendizaje automático y topología deformable para la extracción automática de líneas centrales (centerlines) de costillas en TC torácicos y su numeración anatómica (`R01..R12`, `L01..L12`). Combina tres componentes entrenados —bosques de contexto semántico (Semantic Context Forests, SCF), una U-Net 3D ligera y un atlas estadístico de 24 costillas— más una etapa 3 de etiquetado y refinamiento basada en topología deformable.

El problema que resuelve es la identificación y el etiquetado individual de costillas en volúmenes de TC, una tarea previa habitual en análisis torácico, planificación quirúrgica, cuantificación de deformidades de la caja torácica y generación de datos etiquetados a escala. Los modelos se entrenaron con los 47 escáneres anotados (1.116 costillas) del benchmark de TC torácico de 2 mm de Siemens Corporate Research (SCR) y se evaluaron sobre 12 escáneres de evaluación (286 costillas tras la corrección documentada del ground truth).

El interés actual del repositorio reside en que publica los checkpoints exactos (revisión con el checkpoint de la época 20, `md5 9e456ba9ff81c402a58436c666f152ef`) que reproducen las métricas reportadas, junto con los informes de evaluación por costilla y por sujeto, las estadísticas de proveniencia y la receta de entrenamiento de la U-Net. La suite completa reporta una distancia Chamfer etiquetada (LCD) de 2,05 ± 0,48 mm y un 97,2 % de acierto en los 12 escáneres de evaluación, con 3,64 ± 3,90 mm y 91,8 % en validación cruzada de 5 pliegues sobre 59 escáneres.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: bosques de decisión de contexto semántico (Pass-1, Pass-2 auto-contexto y anclado anatómicamente) + U-Net 3D de 3 niveles + atlas estadístico de 24 costillas + etapa 3 de etiquetado y refinamiento topológico deformable |
| Parámetros totales | 339.889 parámetros en la U-Net 3D (niveles 16 → 32 → 64); los bosques y el atlas no son redes neuronales y no tienen un equivalente de parámetros (120 árboles en Pass-1, 100 árboles en Pass-2, 150 árboles en el forest anatómico con profundidad máxima 24) |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos, MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje). La U-Net 3D procesa parches de 64³ vóxeles; los bosques usan ventanas de features de hasta ±80 mm (Pass-2) y ±40 mm (Pass-1) |
| Tipos de cuantización | No disponible (no se documentan versiones cuantizadas; se distribuyen los pesos en precisión de entrenamiento) |
| Idiomas soportados | No aplica (procesa imágenes de TC, no texto) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) para la U-Net 3D; `.joblib` para los tres bosques y el atlas; ficheros `.json` de configuración de features y de entrenamiento |
| Tamaño del repositorio | 0,6 GB |
| Entrada | TC torácico en unidades Hounsfield (la U-Net recibe la intensidad bruta almacenada normalizada con z-score por volumen) |
| Salida | Curvas de línea central de costilla con etiqueta anatómica `R01..R12` y `L01..L12` |

## Arquitectura y entrenamiento

La U-Net 3D es una U-Net simple de tres niveles (16 → 32 → 64 canales) con dos bloques Conv-GroupNorm-ReLU por nivel y sin bloques residuales. Se entrenó con parches de 64³ vóxeles, función de pérdida de 0,5 soft-Dice + 0,5 BCE, optimizador Adam con tasa de aprendizaje 1e-3, tamaño de lote 2, 8 parches por escáner y época, 20 épocas y sin aumentación de datos. La entrada es el z-score por volumen de las intensidades brutas almacenadas. El checkpoint publicado en esta revisión sustituye al snapshot intermedio anterior (`md5 de4b158b...`) que no reproducía los mapas de probabilidad reportados.

Los bosques de contexto semántico operan como clasificadores por vóxel con features de intensidad y de derivadas gaussianas multiescala. El forest Pass-1 usa 120 árboles y 228 features: intensidad bruta, 27 features de derivadas gaussianas multiescala (sigma 1/2/4 mm: suavizado, magnitud de gradiente, 6 segundas derivadas, laplaciano) y 200 pares RSID con desplazamientos en [-20, 20] vóxeles (±40 mm). El forest Pass-2 de auto-contexto añade 28 features multiescala del mapa de probabilidad de Pass-1 y 50 diferencias de probabilidad con desplazamiento aleatorio en [-40, 40] vóxeles (±80 mm), sumando 306 features con 100 árboles; se entrenó sobre mapas de Pass-1 de un forest anterior y se documenta como base de ablación. El forest anatómicamente anclado usa 150 árboles, profundidad máxima 24 y 286 features: 28 features diferenciales estandarizadas en HU, un proxy de tubularidad por curvatura diagonal por escala (sin descomposición de Hessiano ni filtro de Frangi), coordenadas canónicas `|u|, u, v, w`, distancia a pulmón y 250 pares RSID en [-12, 12] vóxeles (±24 mm).

El atlas estadístico de 24 costillas contiene las curvas canónicas medias (80 puntos por costilla), la media y desviación estándar de un descriptor de 5 dimensiones, estadísticas de espaciado intercostal y una nube de 15.000 puntos para corrección de inclinación; se reproduce exactamente con `python -m ribline.scripts.build_atlas` sobre los 47 escáneres de entrenamiento. La etapa 3 de etiquetado y refinamiento es la que aporta el grueso del rendimiento y es, según el propio autor, la parte cuyos constantes se ajustaron inspeccionando métricas sobre los 12 escáneres de evaluación.

## Capacidades

- Extracción automática de líneas centrales 3D de costillas en TC torácico.
- Etiquetado anatómico individual de las 24 costillas con la nomenclatura `R01..R12` (derecha) y `L01..L12` (izquierda).
- Funcionamiento en modo híbrido completo (SCF + U-Net 3D + etapa 3) o en variantes ablacionadas de menor coste.
- Variante puramente CPU (`ribline-anatomical-scf`), sin necesidad de GPU.
- Inferencia con modelos ligeros: la U-Net tiene 339.889 parámetros y los bosques son evaluables en CPU.
- Generación de mapas de probabilidad por vóxel como paso intermedio, reutilizables para auto-contexto.
- Reproducibilidad verificable: se publican los informes de evaluación, las estadísticas de los 59 escáneres y la receta de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso textual, capacidades multilingües ni procesamiento de audio o vídeo, por no ser un modelo de lenguaje.

## Casos de uso

- Preprocesado de pipelines de análisis torácico: las líneas centrales etiquetadas sirven como entrada para segmentación pulmonar, detección de nódulos o registro anatómico, ya que el modelo entrega curvas con identificador de costilla en lugar de una simple máscara.
- Planificación quirúrgica torácica: la numeración `R01..R12`/`L01..L12` permite referirse de forma inequívoca a costillas concretas antes de una resección o una toracotomía, con una LCD de 2,05 mm en la suite completa.
- Cuantificación de deformidades de la caja torácica: al disponer de curvas por costilla, se pueden medir ángulos, asimetrías y desplazamientos en escoliosis o pectus excavatum comparando pacientes contra el atlas estadístico incluido.
- Seguimiento longitudinal: la etiqueta anatómica estable entre estudios permite comparar la misma costilla en TC de distintos momentos sin registro manual.
- Anotación a escala de cohortes de investigación: la variante CPU-only procesa volúmenes sin GPU, lo que abarata etiquetar grandes series retrospectivas de TC de 2 mm.
- Generación de ground truth para entrenar otros modelos: las salidas del pipeline pueden usarse como pseudoetiquetas para segmentadores de costillas, con la advertencia de las limitaciones de dominio descritas más abajo.
- Análisis forense y de traumatología: la localización precisa de costillas facilita documentar fracturas costales por nivel anatómico en informes estructurados.
- Validación de algoritmos propios: la publicación de `benchmark_val12_fixed_gt.json`, `benchmark_train47.json` y `benchmark_cv5.json` permite comparar métodos propios bajo el mismo protocolo de distancia Chamfer etiquetada y clDice.

## Benchmarks y rendimiento

Resultados publicados en la model card para las cuatro variantes de la colección (LCD = labeled Chamfer distance; Acc = precisión de etiquetado):

| Repositorio | Variante | LCD 12 escáneres (mm) | Acc 12 escáneres (%) | LCD CV 5 pliegues (mm) | Acc CV 5 pliegues (%) |
|---|---|---|---|---|---|
| `wq2012/ribline-3d-ct-centerline` | Suite completa (SCF + U-Net 3D + etapa 3) | 2,05 ± 0,48 | 97,2 | 3,64 ± 3,90 | 91,8 |
| `wq2012/ribline-anatomical-scf` | SCF anclado anatómicamente + etapa 3 (solo CPU) | 2,88 ± 1,32 | 95,1 | 5,28 ± 4,62 | 86,9 |
| `wq2012/ribline-3d-unet` | U-Net 3D ligera + etapa 3 | 3,40 ± 1,99 | 92,0 | 7,44 ± 8,93 | 78,2 |
| `wq2012/ribline-scf-pass2-autocontext` | Baseline SCF de auto-contexto en 2 pasadas + etapa 3 | 9,36 ± 10,57 | 71,0 | No disponible | No disponible |

Detalles del protocolo: `ribline.model.metrics.evaluate_subject_ribs` con sus valores por defecto. El LCD se promedia sobre todas las costillas de ground truth, penalizando con 50 mm las etiquetas ausentes; se calcula clDice etiquetado a 3 mm y 4 mm; una costilla de ground truth se considera correctamente etiquetada si la predicción con la misma etiqueta tiene distancia media predicción-a-GT **y** GT-a-predicción menor o igual a 10 mm y además la costilla de GT es la más cercana a esa predicción. La exhaustividad usa el mismo criterio simétrico sobre cualquier curva predicha; la precisión cuenta las curvas predichas que quedan a menos de 10 mm de alguna costilla de GT. Las medias por sujeto se acompañan de desviación estándar e intervalo de confianza del 95 % por bootstrap con 10.000 remuestreos, y las tasas agregadas con intervalos de Wilson. Los valores concretos de clDice a 3 y 4 mm no aparecen en la información disponible.

## Requisitos de hardware

- La U-Net 3D tiene 339.889 parámetros, de modo que sus pesos ocupan del orden de 1,4 MB en fp32; la inferencia sobre parches de 64³ vóxeles es muy ligera. Estimación orientativa no publicada por el autor: menos de 2 GB de VRAM para la U-Net aislada.
- Existe una variante explícitamente solo CPU: `wq2012/ribline-anatomical-scf` (SCF anclado anatómicamente + etapa 3), sin requisito de GPU.
- GPU recomendadas: no disponible en la información proporcionada. Cualquier GPU con soporte de PyTorch debería poder ejecutar la U-Net por su tamaño; no se documentan modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No se especifica. Por el tamaño del modelo (0,34 M de parámetros) es razonable esperar que sí, pero el autor no publica requisitos ni pruebas en ese sentido.
- Opciones de despliegue: paquete Python `ribline` v0.3.0 (inferencia vía `ribline.model.metrics.evaluate_subject_ribs` y scripts como `python -m ribline.scripts.build_atlas`), con pesos PyTorch `.pth` y modelos `.joblib`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. No se publican tiempos de inferencia por escáner ni curva de escalado.
- Almacenamiento: el repositorio completo ocupa 0,6 GB, incluyendo pesos, configuraciones y los informes de evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento (LCD 12 escáneres) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `wq2012/ribline-3d-ct-centerline` | Híbrido SCF + U-Net 3D + etapa 3 | 339.889 (U-Net) + 3 bosques y atlas | Parches 64³ vóxeles; TC torácico 2 mm | 2,05 ± 0,48 mm; 97,2 % Acc | MIT | Hugging Face |
| `wq2012/ribline-anatomical-scf` | SCF anclado anatómicamente + etapa 3 | 150 árboles, profundidad máx. 24 | Features de ±24 mm; TC torácico 2 mm | 2,88 ± 1,32 mm; 95,1 % Acc | MIT | Hugging Face |
| `wq2012/ribline-3d-unet` | U-Net 3D ligera + etapa 3 | 339.889 (U-Net) | Parches 64³ vóxeles; TC torácico 2 mm | 3,40 ± 1,99 mm; 92,0 % Acc | MIT | Hugging Face |
| `wq2012/ribline-scf-pass2-autocontext` | SCF auto-contexto en 2 pasadas + etapa 3 | 100 árboles | Features de ±80 mm; TC torácico 2 mm | 9,36 ± 10,57 mm; 71,0 % Acc | MIT | Hugging Face |

No se dispone de datos de benchmarks de métodos externos de extracción de líneas centrales de costillas en la información proporcionada, por lo que no es posible establecer una comparación con alternativas de otros autores.

## Limitaciones y advertencias

- **Advertencia de protocolo (caveat) declarada por el autor:** las constantes de la etapa 3 de etiquetado y refinamiento se ajustaron inspeccionando métricas sobre los mismos 12 escáneres de evaluación. Los tres bosques, la U-Net y el atlas se ajustaron únicamente sobre los 47 escáneres de entrenamiento, pero las cifras reportadas son en muestra para las constantes de la etapa 3.
- **Partición no aleatoria:** el conjunto de evaluación corresponde a la cola alfabética de la lista de ficheros, no a un muestreo aleatorio, lo que puede introducir sesgo de composición.
- **Dominio estrecho:** entrenamiento y evaluación provienen exclusivamente del benchmark de TC torácico de 2 mm de Siemens Corporate Research (47 escáneres, 1.116 costillas), sin validación externa con otros equipos, grosores de corte, protocolos de adquisición o poblaciones.
- **Volumen de datos reducido:** 47 escáneres de entrenamiento es una base pequeña para generalización; la validación cruzada de 5 pliegues sobre 59 escáneres muestra un deterioro notable frente a la evaluación fija (LCD de 3,64 ± 3,90 mm y 91,8 % de acierto en la suite completa).
- **Sin aumentación de datos en la U-Net**, según `train_config_unet.json`, lo que limita la robustez frente a variaciones de adquisición.
- **Topología asumida:** el atlas estadístico y el esquema de etiquetado cubren 24 costillas con disposición estándar; variantes anatómicas como costillas cervicales, agenesias o costillas supernumerarias pueden degradar el etiquetado, aunque este extremo no se cuantifica en la información disponible.
- **El forest de auto-contexto Pass-2 se entrenó sobre mapas de Pass-1 generados por un forest anterior**, por lo que el autor lo describe explícitamente como baseline de ablación; sus métricas no deben compararse en igualdad de condiciones con el resto.
- **Corrección de ground truth:** se documenta una corrección de anotación (`RIB_007`, recogida en `gt_fix_log.json`). Las métricas sobre el ground truth original están en `benchmark_val12_original_gt.json` y pueden diferir.
- **Checkpoints revisados:** la revisión sustituye `rib_unet_3d.pth` por el checkpoint de la época 20 (`md5 9e456ba9ff81c402a58436c666f152ef`). Cualquier resultado reproducido con el snapshot anterior es inconsistente con las métricas publicadas.
- **Riesgo de error silencioso:** el pipeline emite siempre etiquetas `R01..R12`/`L01..L12`, por lo que una predicción anatómicamente incorrecta puede pasar desapercibida si no se valida con el criterio simétrico de 10 mm descrito en el protocolo.
- **Uso clínico:** no se documentan validaciones regulatorias, estudios multicéntricos ni certificaciones; el uso en decisiones clínicas requiere validación local independiente.
- **Licencia:** MIT, que permite uso comercial y modificación con conservación del aviso de copyright y de la licencia.
- **Idiomas y texto:** no aplica; el modelo no procesa lenguaje natural.
- **Búsqueda web:** las consultas realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos correspondían a un portal educativo no relacionado), por lo que toda la información procede del repositorio de Hugging Face y de su model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wq2012/ribline-3d-ct-centerline
- Colección ribline en Hugging Face: https://huggingface.co/collections/wq2012/ribline
- Repositorio de código ribline (v0.3.0): https://github.com/wq2012/ribline
- Variante SCF anclado anatómicamente (solo CPU): https://huggingface.co/wq2012/ribline-anatomical-scf
- Variante U-Net 3D ligera: https://huggingface.co/wq2012/ribline-3d-unet
- Variante baseline SCF de auto-contexto en 2 pasadas: https://huggingface.co/wq2012/ribline-scf-pass2-autocontext
