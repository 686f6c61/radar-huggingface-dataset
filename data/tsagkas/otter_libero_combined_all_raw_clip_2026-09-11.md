# Tsagkas/otter_LIBERO_combined_all_raw_clip_2026-09-11

## Resumen

`Tsagkas/otter_LIBERO_combined_all_raw_clip_2026-09-11` es una política de robótica (no un modelo de lenguaje) entrenada y publicada con la librería LeRobot de Hugging Face, con pipeline declarado `robotics`. El autor es el usuario `Tsagkas` y el checkpoint se ha entrenado sobre el dataset `Tsagkas/libero_combined_all_raw`, cuyo nombre sugiere episodios de manipulación del benchmark LIBERO en su variante combinada y sin procesar. El modelo ocupa 44.643.916 parámetros (aproximadamente 44,6 millones) y el repositorio pesa 0,2 GB en formato safetensors.

El checkpoint se publicó el 11 de septiembre de 2026 y su model card es prácticamente la plantilla genérica que genera LeRobot: no documenta la arquitectura, ni el número de tokens o pasos de entrenamiento, ni los hiperparámetros, ni resultados de evaluación. La propia plantilla indica explícitamente «_Model type not recognized — please update this template_», por lo que el tipo de política (`otter`) no está reconocido por LeRobot y no se puede confirmar si se trata de una variante de ACT, de Diffusion Policy u otra arquitectura.

Su relevancia es acotada y de nicho: sirve como artefacto reproducible dentro del ecosistema LeRobot para experimentos de aprendizaje por imitación sobre LIBERO, y como posible punto de partida para fine-tuning con `lerobot-train`. Con cero descargas y cero «likes» en el momento de la consulta, y sin métricas publicadas, debe tratarse como un experimento de investigación sin validación externa, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card indica que el tipo de modelo (`otter`) no está reconocido por la plantilla de LeRobot; no se confirma ACT, Diffusion Policy ni transformer de política concreto |
| Parametros totales | 44.643.916 (44,6 M aproximadamente, dato real de los pesos safetensors) |
| Longitud de contexto | No aplica en el sentido de LLM. La ventana de observación (historial de imágenes y estados) no está documentada: no disponible |
| Tipos de cuantizacion | No disponible. Al ser pesos safetensors, la cuantización no viene precomputada; requeriría conversión manual |
| Idiomas soportados | No aplica / no disponible. Es una política visomotora; no procesa lenguaje natural de forma documentada, pese a que el nombre del checkpoint incluye «clip» |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Libreria / ecosistema | LeRobot (`library_name: lerobot`) |
| Pipeline declarado | `robotics` |
| Dataset de entrenamiento | `Tsagkas/libero_combined_all_raw` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 en la fecha de consulta |
| Fecha de creacion | 2026-09-11T14:01:43Z |
| Fecha de actualizacion | 2026-09-11T14:01:59Z (18 segundos despues de la creacion) |
| Region declarada | `us` |

## Arquitectura y entrenamiento

No hay información fiable sobre la arquitectura. La model card es la plantilla automática de LeRobot y no rellena la sección de detalles: solo declara la licencia Apache 2.0 y remite a la documentación general de la librería. El campo `model_name` es `otter` y el propio texto generado advierte de que el tipo de modelo no ha sido reconocido. El único indicio indirecto es el fragmento de ejemplo de la propia plantilla, que invoca `--policy.type=act`, pero ese comando es un ejemplo genérico de la documentación de LeRobot y no confirma que este checkpoint concreto haya sido entrenado con ACT.

Tampoco se documenta el entrenamiento: no se indica el número de pasos, el tamaño de lote, el número de episodios del dataset, si hubo aumento de datos, si se congeló el codificador visual ni si se aplicó algún tipo de ajuste fino posterior (RLHF, DPO u otro). Dado el tamaño del repositorio (0,2 GB) y los 44,6 M de parámetros, es plausible que el codificador visual esté incluido en los pesos, pero es una inferencia del tamaño, no un dato confirmado. El sufijo `clip` del nombre del repositorio sugiere el uso de un codificador visual tipo CLIP, y `combined_all_raw` apunta a una agregación de todos los episodios del dataset LIBERO sin filtrar, pero ninguna de las dos cosas está verificada en la documentación.

## Capacidades

- Generación de acciones motoras a partir de observaciones visomotrices, en el marco de una política de imitación de LeRobot. La dimensionalidad del espacio de acciones no está documentada.
- Control de robots compatibles con LeRobot mediante el flujo `lerobot-record`, que en el ejemplo de la model card apunta a un `so100_follower`.
- Evaluación y reproducción de experimentos sobre el dataset `libero_combined_all_raw`.
- Fine-tuning mediante `lerobot-train` sobre datasets propios en formato LeRobot.
- No hay evidencia de soporte de tool calling, function calling ni razonamiento multi-paso: son capacidades propias de modelos de lenguaje y no aplican a este artefacto.
- No hay evidencia de capacidades multilingües, modo «thinking», entrada de audio ni salida de texto.
- Capacidad de visión: probable, dado que se trata de una política visomotora y que el nombre incluye `clip`, pero el tipo y la resolución del codificador visual no están documentados.

## Casos de uso

- Evaluación comparativa sobre LIBERO: cargar el checkpoint con `lerobot-record` y medir tasas de éxito por suite de tareas para usarlo como referencia frente a otras políticas entrenadas sobre el mismo dataset. Es adecuado porque el nombre del dataset de entrenamiento coincide con el benchmark, aunque el autor no publica resultados.
- Fine-tuning para tareas de pick-and-place en brazos de bajo coste tipo SO-100/SO-101: partir de estos 44,6 M de parámetros y reentrenar sobre un dataset propio de teleoperación, aprovechando que el flujo de LeRobot permite hacerlo con un único comando.
- Reproducción de experimentos de aprendizaje por imitación: sirve como artefacto congelado para verificar que un pipeline de entrenamiento propio reproduce el mismo comportamiento, dado que el repositorio es pequeño (0,2 GB) y ligero de cargar.
- Punto de partida para destilación o poda: con 44,6 M de parámetros, es un candidato razonable para generar variantes más pequeñas y medir la pérdida de tasa de éxito.
- Despliegue en hardware de gama baja para demostraciones: por tamaño, cabría en una GPU integrada o incluso en CPU para inferencia a baja frecuencia, lo que permite montar demos de laboratorio sin clúster.
- Generación de datos sintéticos o aumentados en simulación: ejecutar la política en un entorno LIBERO para producir trayectorias adicionales que alimenten un bucle de entrenamiento iterativo.
- Docencia y prácticas de robótica: al estar bajo Apache 2.0 y en el ecosistema LeRobot, es utilizable en cursos sin restricciones de licencia, siempre que se asuma que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tabla de tasas de éxito por suite de LIBERO, ni comparaciones con ACT, Diffusion Policy u otras políticas, ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada solo por el tamaño de los pesos: aproximadamente 178 MB en fp32, 89 MB en fp16/bf16 y 45 MB en int8. Son cálculos aritméticos sobre los 44.643.916 parámetros declarados, no mediciones.
- La VRAM real de inferencia es mayor que la de los pesos: depende del codificador visual, de la resolución de entrada, del historial de observaciones y del tamaño de lote. Ese dato no está disponible.
- GPU: cualquier GPU con al menos 2-4 GB de VRAM debería ser suficiente en la práctica; tarjetas como RTX 3060, RTX 4090, A100 o H100 son holgadas para este tamaño. No hay requisitos oficiales publicados.
- GPU de consumo: sí, cabe con margen en cualquier GPU de consumo moderna, e incluso en iGPU con memoria compartida suficiente para lotes pequeños.
- CPU: viable para inferencia en bucle cerrado a baja frecuencia, aunque la latencia por paso no está documentada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es el flujo indicado por el autor. No hay confirmación de soporte para vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje y no a políticas de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El ecosistema LeRobot incluye otras familias de políticas habitualmente usadas sobre LIBERO (por ejemplo, ACT o Diffusion Policy), pero no se han facilitado parámetros, contexto ni métricas de ninguna de ellas, y publicar una tabla con valores «no disponible» en todas las celdas no aportaría información.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tsagkas/otter_LIBERO_combined_all_raw_clip_2026-09-11` | 44,6 M | No disponible | No publicado | Apache 2.0 | Hugging Face, 0 descargas |
| Alternativas en LeRobot (ACT, Diffusion Policy, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar, con el aviso explícito de que el tipo de modelo no ha sido reconocido.
- Cero validación externa: 0 descargas y 0 «likes» en el momento de la consulta, sin resultados de benchmarks publicados, por lo que la tasa de éxito real es desconocida.
- Riesgo alto de sobreajuste al dataset `libero_combined_all_raw`: el nombre indica que se entrenó sobre la combinación completa de episodios, sin que se documenten particiones de validación ni estrategias de generalización.
- Sesgos: no documentados. En robótica, los sesgos suelen aparecer como dependencia de las condiciones de iluminación, la textura del entorno, la posición inicial de los objetos o la cámara concreta usada en la recolección, pero no hay información específica para este checkpoint.
- Alucinación: el concepto no aplica igual que en un LLM, pero sí existe el riesgo equivalente de generar trayectorias no seguras o sin sentido ante observaciones fuera de la distribución de entrenamiento.
- Idiomas: no aplica. No hay evidencia de procesamiento de lenguaje natural, pese al sufijo `clip` en el nombre.
- Longitud de contexto: no documentada; se desconoce cuántos fotogramas de historial acepta la política, lo que impide planificar tareas de horizonte largo.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías. Es la parte mejor documentada del repositorio.
- Caveat para producción: no debería desplegarse en un robot real sin una evaluación previa en simulación y con protocolos de parada de emergencia, dado que no existe ninguna métrica pública de seguridad o fiabilidad.
- Fecha de creación y actualización separadas por 18 segundos: indica una subida automatizada, sin revisión posterior del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tsagkas/otter_LIBERO_combined_all_raw_clip_2026-09-11
- Dataset de entrenamiento: https://huggingface.co/datasets/Tsagkas/libero_combined_all_raw
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
