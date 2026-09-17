# ypz21/GALA_robocasa_gr1

## Resumen

GALA_robocasa_gr1 es un checkpoint de inferencia del proyecto GALA, publicado por el usuario ypz21 en HuggingFace, destinado a la evaluación de políticas robóticas en el entorno de simulación RoboCasa con el robot humanoide GR1 en tareas de mesa (tabletop). No es un modelo de lenguaje al uso, sino una política visión-lenguaje-acción (VLA) entrenada a partir del backbone Qwen2.5-VL-3B-Instruct, con 4.833.350.656 parámetros (~4,83 mil millones) y un repositorio de 19,3 GB distribuido en cuatro shards de safetensors.

El checkpoint está diseñado para ejecutarse con el cargador de inferencia propio del proyecto GALA (repositorio privado, requiere acceso) junto con el procesador y los archivos del backbone Qwen2.5-VL. No funciona como un pipeline estándar de Transformers, vLLM o llama.cpp, lo que limita su uso fuera del entorno de investigación para el que fue pensado. El export incluye únicamente pesos de inferencia, índice, configuración y metadatos de normalización/modalidad de GR1; excluye estados de optimizador y scheduler, estados aleatorios, registros de entrenamiento, el cabezal de predicción de bridge-supervision y metadatos de otros embodiments.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para investigar manipulación de mesa en simulación con GR1, ya que el autor valida numéricamente que el export produce acciones idénticas al checkpoint original ante entradas fijas. La model card advierte explícitamente de que el modelo es para investigación en simulación y que el despliegue en robots físicos no ha sido validado por esta release.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política VLA sobre el backbone Qwen2.5-VL-3B-Instruct; la evaluación con pasos de denoising apunta a un cabezal de acciones generativo, pero la model card no detalla la arquitectura interna |
| Parámetros totales | 4.833.350.656 (~4,83 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el checkpoint; el modelo base Qwen2.5-VL-3B-Instruct declara 32.768 tokens nativos, dato no confirmado para esta política |
| Tipos de cuantización | no disponible; no se publican variantes cuantizadas y el export conserva la precisión original de los pesos |
| Idiomas soportados | no disponible; el backbone Qwen2.5-VL es multilingüe, pero las entradas de la política son observaciones e instrucciones robóticas |
| Licencia | no disponible; Qwen2.5-VL y los assets del simulador mantienen sus licencias originales |
| Formato de pesos | safetensors (cuatro shards más su índice) |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Pipeline declarado | robotics |
| Tipo de acciones | acciones de articulación absolutas (absolute joint actions) |
| Chunk de acciones | 16 pasos por chunk |
| Pasos de denoising | 4 |
| Tamaño del repositorio | 19,3 GB |
| Idioma del backbone | Qwen2.5-VL-3B-Instruct (inglés y otros idiomas según su model card) |
| Fecha de publicación | 17 de septiembre de 2026 (creación y última actualización el mismo día) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint sigue el paradigma VLA: un backbone de visión-lenguaje (Qwen2.5-VL-3B-Instruct, transformer con torre de visión y proyector multimodal) al que se añade un cabezal de generación de acciones. La única pista sobre el cabezal es la configuración de evaluación declarada por el autor: 16 pasos de acción por chunk y 4 pasos de denoising, lo que encaja con un esquema de difusión o flow matching en el espacio de acciones, aunque la model card no lo especifica de forma explícita. No se documentan detalles de atención, positional encodings ni mecanismos adicionales.

En cuanto al entrenamiento, la información disponible es mínima: no se indican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO o aprendizaje por imitación más allá de la mención implícita a un entrenamiento de política. La model card indica que el export excluye el cabezal de predicción de bridge-supervision (bridge-supervision prediction head), lo que sugiere que el pipeline de entrenamiento original empleaba alguna forma de supervisión puente entre modalidades, pero ese componente no forma parte de los pesos liberados. El export sí conserva la precisión original de los pesos de inferencia y se ha validado numéricamente contra el checkpoint original con entradas fijas, obteniendo acciones idénticas.

La evaluación declarada usa 24 tareas ID (in-distribution) con 50 episodios por tarea. El autor señala que los resultados son estocásticos, sin publicar tasas de éxito.

## Capacidades

- Generación de acciones de control para el robot GR1 en tareas de manipulación de mesa dentro del simulador RoboCasa.
- Procesamiento de observaciones visuales y entradas multimodales heredado del backbone Qwen2.5-VL-3B-Instruct.
- Producción de chunks de 16 acciones de articulación absolutas mediante 4 pasos de denoising.
- Ejecución de evaluación paralela por ID a través del cargador de inferencia de GALA (según el README del repositorio de código).
- Reproducibilidad numérica: el export genera acciones idénticas al checkpoint original ante entradas fijas.
- No se documentan capacidades de tool calling, function calling, uso como agente multi-paso, razonamiento en lenguaje natural ni modo de pensamiento explícito.
- No se documentan capacidades de audio, vídeo de larga duración ni generación de texto como producto final.

## Casos de uso

- Evaluación de investigación en manipulación tabletop: ejecutar las 24 tareas ID de RoboCasa con GR1 y 50 episodios por tarea para obtener medidas de éxito comparables dentro del mismo protocolo de simulación.
- Reproducción de resultados de GALA: al requerir el cargador de inferencia del proyecto y validarse numéricamente contra el checkpoint original, sirve para replicar experimentos previos del equipo en lugar de reentrenar desde cero.
- Baseline en comparativas de políticas VLA: usar este checkpoint como referencia fija sobre el mismo entorno y conjunto de tareas al evaluar variantes arquitectónicas o de entrenamiento.
- Fine-tuning sobre nuevas tareas de RoboCasa: al partir de un backbone Qwen2.5-VL-3B-Instruct y de pesos de política ya alineados con el embodiment GR1, es un punto de partida razonable para adaptar la política a otras tareas del mismo simulador.
- Generación de rollouts sintéticos: producir trayectorias en simulación para análisis de comportamiento, estudio de modos de fallo o como datos auxiliares en pipelines de imitación.
- Ablación de parámetros de inferencia: variar el número de pasos de denoising o la longitud del chunk (por defecto 16 acciones y 4 pasos) para medir su efecto en la calidad y estabilidad de las acciones.
- Verificación de conversiones y exports de pesos: la validación numérica con entradas fijas convierte al checkpoint en un patrón de referencia para comprobar que un pipeline de exportación reproduce acciones idénticas.
- Docencia y demos de VLA en simulación: ilustrar el ciclo observación-visión-lenguaje-acción sin necesidad de hardware robótico, con la advertencia de que el repositorio de código es privado y requiere autorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de evaluación (24 tareas ID, 50 episodios por tarea, acciones de articulación absolutas, chunks de 16 acciones, 4 pasos de denoising y resultados estocásticos), sin incluir tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada en precisión original (bf16): aproximadamente 9,7 GB solo para los pesos de la política, más el coste del procesador y la torre de visión de Qwen2.5-VL y de los búferes de inferencia.
- VRAM estimada si los pesos estuvieran en fp32: aproximadamente 19,3 GB, cifra coherente con el tamaño total del repositorio (19,3 GB).
- GPU de 24 GB: RTX 3090, RTX 4090, A5000 o L4 permiten inferencia en bf16 con margen razonable.
- GPU de 16 GB: viable solo reduciendo precisión o aplicando cuantización manual, ya que no se publican variantes cuantizadas.
- GPU de datacenter: A100 o H100 no son necesarias para una sola instancia, pero resultan útiles para lanzar evaluación paralela en múltiples entornos de simulación.
- Consumer GPU: sí cabe en tarjetas de gama alta con 24 GB en bf16; en 16 GB requiere ajustes no documentados por el autor.
- Opciones de despliegue: no compatible con vLLM, TGI, llama.cpp ni Ollama como pipeline estándar. Requiere el cargador de inferencia de GALA (repositorio privado con acceso restringido), los archivos del procesador y backbone de Qwen2.5-VL-3B-Instruct y el entorno del simulador RoboCasa.
- Latencia y throughput estimados: no disponible. Cabe esperar el coste de 4 pasos de denoising por cada chunk de 16 acciones, pero no se publican medidas de latencia ni de acciones por segundo.
- Almacenamiento: prever al menos 19,3 GB para el checkpoint, más el espacio de los archivos del backbone y de los assets del simulador.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de conocimiento general y no han sido verificados en la búsqueda web de esta ficha; se marcan como tales. No es posible comparar rendimiento porque GALA_robocasa_gr1 no publica tasas de éxito.

| Modelo | Parámetros | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|
| GALA_robocasa_gr1 | ~4,83 mil millones | Qwen2.5-VL-3B-Instruct | no disponible | pesos en HuggingFace con autenticación; cargador de inferencia en repositorio privado |
| OpenVLA-7B (referencia externa, no verificada) | ~7 mil millones | Llama-2-7B con codificadores DINOv2 y SigLIP | licencia comunitaria de Llama 2 | pesos públicos en HuggingFace |
| pi-0 / openpi (referencia externa, no verificada) | del orden de 3 mil millones | PaliGemma con cabezal de flow matching | Apache 2.0 | pesos y código públicos |
| GR00T N1 (referencia externa, no verificada) | del orden de 2 mil millones | arquitectura propia de NVIDIA con torre de visión | licencia comunitaria de NVIDIA | pesos públicos en HuggingFace |

Diferencias relevantes: GALA_robocasa_gr1 es el único de la lista con licencia sin especificar, sin métricas publicadas y con dependencia de un repositorio de código privado, lo que dificulta su reproducción por terceros. Los tres alternativas citadas publican pesos y código con licencias identificables, aunque su entrenamiento y evaluación se centran en otros conjuntos de tareas y embodiments.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar que el uso comercial esté permitido. Los componentes de Qwen2.5-VL y los assets del simulador quedan sujetos a sus licencias originales.
- Dependencia de código privado: la ejecución requiere el cargador de inferencia de GALA, alojado en un repositorio privado con acceso restringido; sin autorización, el checkpoint no es utilizable.
- No es un pipeline estándar: no funciona con Transformers, vLLM, TGI, llama.cpp ni Ollama sin trabajo de integración adicional.
- Validación limitada a simulación: el despliegue en robots físicos no ha sido validado por esta release, según advierte la propia model card.
- Sin métricas publicadas: se desconoce la tasa de éxito en las 24 tareas ID y no hay comparaciones numéricas con otras políticas.
- Resultados estocásticos: la evaluación declarada produce resultados variables entre ejecuciones, lo que complica la comparación directa si no se fija la semilla.
- Sesgo de distribución: las 24 tareas son in-distribution; no se documenta el comportamiento ante tareas, objetos o iluminaciones fuera de esa distribución.
- Alcance del embodiment: el checkpoint está ajustado a GR1 y a los metadatos de normalización de ese robot; no incorpora metadatos de otros embodiments, por lo que no se espera transferencia directa a otras plataformas.
- Componentes excluidos: el cabezal de bridge-supervision y los estados de entrenamiento no están incluidos, de modo que el checkpoint no permite reanudar entrenamiento tal cual.
- Idiomas: no se documenta el comportamiento multilingüe de la política; las instrucciones de tarea en RoboCasa suelen formularse en inglés.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero existe riesgo de acciones incoherentes o inseguras fuera del dominio entrenado; al evaluarse solo en simulación, el riesgo físico directo está acotado.
- Madurez y adopción: cero descargas y cero likes en el momento de redactar esta ficha, sin validación independiente por parte de la comunidad.
- Ventana de contexto: no se documenta el contexto efectivo usado por la política, aunque el backbone declare 32.768 tokens nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ypz21/GALA_robocasa_gr1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio de código de GALA (privado, requiere acceso): https://github.com/PuzhenYuan/GALA
- La búsqueda web realizada para esta ficha no devolvió resultados relevantes: únicamente páginas de ayuda de Google Translate y ensayos genéricos sin relación con el modelo. No se han localizado papers, blogs ni demos adicionales.
