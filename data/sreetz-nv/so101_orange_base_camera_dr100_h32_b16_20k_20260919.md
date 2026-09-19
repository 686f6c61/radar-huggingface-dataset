# sreetz-nv/so101_orange_base_camera_dr100_h32_b16_20k_20260919

## Resumen

SO-101 base-height and external-camera DR100 es una política robótica visuomotora (vision-language-action) obtenida por ajuste fino de GR00T N1.7 sobre 100 episodios scripted considerados exitosos. La desarrolla el usuario sreetz-nv y se distribuye a través de HuggingFace dentro del ecosistema LeRobot, con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y un repositorio de 12,6 GB en formato safetensors. Su propósito es controlar un brazo SO-101 de color naranja a partir de dos cámaras (una externa angulada y una de muñeca), emitiendo acciones articulares en grados y un valor porcentual de pinza.

El interés técnico del modelo reside en el régimen de domain randomization aplicado durante el entrenamiento: se introduce una variación de la altura de la base del robot de ±15 mm y una variación leve de la focal y la posición de la cámara externa, manteniendo el frustum pinhole nominal. El objetivo es que la política no dependa de una calibración extrínseca exacta ni de una altura de montaje fija, algo habitual en despliegues reales donde el robot se recoloca entre sesiones.

Ahora bien, se trata de un artefacto de investigación con validación incompleta: la evaluación en simulación está pendiente, no se ha medido ningún beneficio de transferencia a robot real y, según el propio autor, la intervención combinada no permite aislar el efecto de la altura del de la cámara. No se declara licencia, no hay benchmarks publicados y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (política vision-language-action); detalle interno de capas no disponible |
| Parámetros totales | 3.144.016.000 (≈3,14 mil millones), según safetensors |
| Longitud de contexto | no disponible; el horizonte de acción configurado es H=32 pasos |
| Tipos de cuantización | no disponible; solo se publican pesos en safetensors, sin versiones cuantizadas documentadas |
| Idiomas soportados | no disponible; no se documenta condicionamiento por lenguaje natural en esta ficha |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |
| Tamaño del repositorio | 12,6 GB |
| Modalidades de entrada | imágenes de cámara externa angulada y cámara de muñeca |
| Modalidades de salida | acciones de brazo en grados nativos y pinza en porcentaje |
| Robot objetivo | SO-101 (variante naranja) |
| Fecha de creación | 2026-09-19 |

## Arquitectura y entrenamiento

La información disponible identifica la base como GR00T N1.7, una política vision-language-action, pero no detalla la composición interna de capas, el backbone visual ni el mecanismo de generación de acciones. Lo que sí se documenta es la configuración de ajuste fino: horizonte de acción H=32, tamaño de lote 16, 20.000 actualizaciones, tasa de aprendizaje 1e-4 con schedule coseno, 500 actualizaciones de warmup y semilla 42. Las acciones se representan en grados nativos para el brazo, con acciones relativas, y en porcentaje absoluto para la pinza. El repositorio contiene la política final y los ficheros de procesadores (normalización), junto con cuatro checkpoints locales en 5k, 10k, 15k y 20k actualizaciones que no se distribuyen aquí.

El entrenamiento se realizó sobre 100 episodios scripted con dos ejes de domain randomization: variación de la altura de la base del robot de ±15 mm y variación leve de focal y posición de la cámara externa que preserva el frustum pinhole nominal. Se mantienen la cámara externa angulada original y la cámara de muñeca. El dataset se transfirió de forma privada por SSH y los hashes de los ficheros fuente quedan registrados en el manifest, junto con la revisión base (2fc962b973bccdd5d8ce4f67cc63b264d6886495) y el commit del entrenador (30da8e687a6dfc617fcd94afc367ac7071c376ce). El autor advierte explícitamente de que la intervención combinada no aísla el efecto de la altura del de la cámara, por lo que no puede atribuirse la robustez observada a una sola fuente de variación.

## Capacidades

- Generación de acciones de manipulación para un brazo SO-101 a partir de observaciones visuales de dos cámaras, en bloques de hasta 32 pasos (H=32).
- Control de pinza mediante valor porcentual absoluto y de articulaciones mediante acciones relativas expresadas en grados nativos.
- Robustez inducida por domain randomization frente a variaciones de altura de montaje de la base de ±15 mm.
- Robustez inducida frente a variaciones leves de focal y posición de la cámara externa, siempre que se preserve el frustum pinhole nominal.
- Ejecución de la tarea sobre la que se grabaron los 100 episodios scripted de entrenamiento; no se documenta generalización a otras tareas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento: no es un modelo de propósito general de texto.
- No se documenta condicionamiento por instrucciones en lenguaje natural en esta ficha, pese a que la familia base sea de tipo vision-language-action.
- No se documentan capacidades multilingües, de audio ni de visión general (captioning, VQA).

## Casos de uso

- Control de un SO-101 en laboratorio con recolocaciones frecuentes: la política tolera variaciones de ±15 mm en la altura de la base, lo que reduce la necesidad de recalibrar la altura de montaje entre sesiones.
- Estudio de robustez a domain randomization: sirve como punto de partida para experimentos que comparen políticas entrenadas con y sin variación de altura y de cámara, siempre teniendo en cuenta que aquí ambos factores están confundidos.
- Ajuste fino con pocas demostraciones: al partir de GR00T N1.7 y haberse adaptado con solo 100 episodios, es un candidato razonable como inicialización para nuevas tareas del mismo robot y misma configuración de cámaras.
- Investigación en transferencia sim-a-real: el modelo está pensado para evaluación en simulación, todavía pendiente, por lo que puede emplearse para montar el pipeline de evaluación antes de medir transferencia real.
- Análisis de dinámica de entrenamiento: los checkpoints intermedios en 5k/10k/15k/20k permiten estudiar la evolución del rendimiento a lo largo del ajuste fino y detectar sobreajuste temprano.
- Reproducción de experimentos con semilla fija: la semilla 42, el schedule coseno y los hashes de revisión base y entrenador facilitan la replicación del ajuste fino en un entorno LeRobot.
- Integración en un stack LeRobot para despliegue local: al publicarse en safetensors con procesadores incluidos, puede cargarse directamente en el ecosistema LeRobot para bucles de inferencia sobre hardware propio.
- Comparación de configuraciones de cámara: útil para evaluar cuánto degrada el rendimiento un cambio de focal o de posición de la cámara externa dentro del rango de variación visto en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que la evaluación en simulación está pendiente y que no se ha medido ningún beneficio de transferencia a robot real.

## Requisitos de hardware

- Pesos publicados: el repositorio ocupa 12,6 GB, cifra coherente con 3.144.016.000 parámetros almacenados en fp32 (≈12,58 GB de pesos). Es una inferencia a partir del tamaño, no un dato declarado por el autor.
- VRAM estimada en fp32 (formato publicado): aproximadamente 14-16 GB, sumando pesos, codificadores visuales y buffers de inferencia. Estimación aritmética, no medida publicada.
- VRAM estimada en bf16/fp16: aproximadamente 8-10 GB, previa conversión manual de los pesos, que el autor no documenta.
- VRAM estimada en int8: aproximadamente 4-5 GB; en int4, aproximadamente 2-3 GB, en ambos casos mediante cuantización no soportada oficialmente por el repositorio.
- GPU recomendadas: H100, A100 (40/80 GB) o L40S para despliegue en servidor sin restricciones; RTX 4090 o RTX 3090 (24 GB) para inferencia local en fp32 o bf16.
- GPU de consumo: cabe en tarjetas de 24 GB en fp32 y en tarjetas de 16 GB en bf16 tras conversión. En GPU de 8-12 GB requeriría cuantización agresiva no documentada.
- Opciones de despliegue: la librería declarada es LeRobot; el stack natural es el de GR00T N1.7. Los servidores orientados a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no dan soporte nativo a políticas vision-language-action de este tipo, por lo que no se consideran opciones directas sin desarrollo adicional.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Horizonte de acción | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| SO-101 DR100 (este modelo) | 3,14 mil millones | H=32 | no disponible | HuggingFace, 0 descargas | evaluación en simulación pendiente |
| GR00T N1.7 (modelo base) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | no disponible |
| Otras políticas VLA de manipulación | no disponible | no disponible | no disponible | no disponible en la información proporcionada | no disponible |

No se dispone de datos verificables en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenamiento con solo 100 episodios scripted: la cobertura de estados y de variabilidad de la tarea es estrecha, con riesgo elevado de fallo ante situaciones fuera de esa distribución.
- Evaluación en simulación pendiente y ausencia de medición de transferencia a robot real, tal como reconoce el propio autor.
- La intervención combinada (altura de base y cámara) no aísla el efecto de cada factor, lo que impide atribuir la robustez a una causa concreta.
- Especificidad de hardware: está ajustado para un SO-101 naranja con cámara externa angulada y cámara de muñeca concretas, y con una convención de acciones determinada (grados nativos, acciones relativas de brazo y pinza absoluta en porcentaje). Cambiar cámaras, montaje o convención de acciones invalida el modelo.
- Sin licencia declarada: no puede asumirse permiso de uso comercial. Cualquier uso en producción exige contactar con el autor para aclarar los términos.
- Sin idiomas ni condicionamiento por lenguaje documentados, lo que limita su uso en interfaces que esperen instrucciones en texto.
- Riesgo de sobreajuste a las trayectorias scripted: no hay datos de validación independientes que cuantifiquen el error de la política.
- Repositorio sin tracción en la comunidad (0 descargas, 0 likes) y publicado el mismo día de su creación en 2026, sin revisión externa conocida.
- Dependencia de revisiones concretas del código base y del entrenador; cambios en esas revisiones pueden dificultar la reproducción exacta.
- Los resultados devueltos por la búsqueda web no guardan relación con el modelo (páginas de Discord), por lo que no se ha podido contrastar información externa ni verificar afirmaciones de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/sreetz-nv/so101_orange_base_camera_dr100_h32_b16_20k_20260919
- Revisión base de GR00T N1.7 indicada en el manifest: 2fc962b973bccdd5d8ce4f67cc63b264d6886495
- Commit del entrenador indicado en la model card: 30da8e687a6dfc617fcd94afc367ac7071c376ce
- No se han encontrado enlaces relevantes adicionales en la búsqueda web: los resultados devueltos corresponden a páginas de Discord y no están relacionados con el modelo.
