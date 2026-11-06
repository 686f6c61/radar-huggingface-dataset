# Traly/concertina-pretrain-90k

## Resumen

Concertina es un modelo de visión-lenguaje-acción (VLA) orientado a robótica de manipulación, desarrollado por Chengcheng Wang, Wei He, Wenhao Li, Hongguang Li, Kai Han, Jianyuan Guo y Chang Xu. Este repositorio concreto, `Traly/concertina-pretrain-90k`, contiene el checkpoint resultante de las dos etapas de preentrenamiento del artículo (90.000 actualizaciones en total) y sirve como punto de partida para los ajustes finos en CALVIN y LIBERO que se describen en la publicación. El modelo parte del backbone `fudan-generative-ai/Bard-VL-B4-Mask-4B-Instruct`, un VLM de aproximadamente 4.400 millones de parámetros.

La propuesta técnica central es unificar manipulación y cognición en un único modelo de difusión de visión-lenguaje, de modo que el mismo sistema pueda razonar sobre la escena y emitir acciones motoras. El checkpoint se distribuye como un directorio de política autocontenido de LeRobot (tipo `concertina`), con pesos en bf16, procesadores pre y post guardados y los ficheros de configuración, tokenizador e image-processor del backbone. Está pensado para investigadores que quieran reproducir o extender los resultados del artículo sin reentrenar desde cero las etapas de preentrenamiento.

Es relevante ahora porque el ecosistema LeRobot se está consolidando como estándar para políticas robóticas reproducibles, y este checkpoint ofrece un punto de partida de 4.400 millones de parámetros entrenado sobre grandes conjuntos de datos de manipulación (DROID, AgiBot World, RoboMIND) con licencia MIT, lo que facilita su uso académico y comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión visión-lenguaje-acción (VLA) sobre backbone VLM Bard-VL-B4-Mask-4B-Instruct; política LeRobot de tipo `concertina` |
| Parámetros totales | 4.447.963.669 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (bf16) dentro de un directorio de política LeRobot; incluye `config.json`, procesadores y `backbone/` |

## Arquitectura y entrenamiento

Concertina se construye sobre un backbone VLM de tipo Bard-VL (4B, variante Mask-4B-Instruct) y añade un cabezal de difusión para generar acciones de manipulación, integrando así percepción visual, comprensión del lenguaje y control motor en un único modelo. El checkpoint liberado corresponde a las dos etapas de preentrenamiento: parte de un checkpoint intermedio de 60.000 pasos (no publicado) y se entrena durante 30.000 actualizaciones adicionales, sumando 90.000 en total.

El entrenamiento se realizó con 8 GPUs y un batch size de 192 por GPU (1.536 muestras por actualización) sobre 39 conjuntos de datos de preentrenamiento que incluyen DROID, AgiBot World y RoboMIND, ninguno de los cuales se ha publicado. No se congeló ningún parámetro: todos los pesos, incluido el backbone, se entrenaron durante el proceso. La configuración exacta está en `configs/train/pretrain_90k.yaml` del repositorio de código. El modelo sirve como padre para los ajustes finos de CALVIN y LIBERO mediante el campo `policy.pretrained_path`.

## Capacidades

- Manipulación robótica: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Razonamiento visión-lenguaje: hereda del backbone Bard-VL la capacidad de interpretar escenas e instrucciones complejas.
- Integración cognición-acción: el mismo modelo aborda tanto la comprensión semántica de la tarea como la política de control.
- Generación por difusión de acciones: produce trayectorias de acción continuas mediante un proceso de difusión.
- Compatibilidad con LeRobot: se carga como política `concertina` dentro del ecosistema LeRobot, con pre y post-procesadores incluidos.
- Ajuste fino posterior: diseñado explícitamente como base para fine-tuning en benchmarks de manipulación (CALVIN, LIBERO).
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio especial: no disponible.

## Casos de uso

- Investigación en manipulación robótica: sirve como inicialización para experimentos en CALVIN y LIBERO, reduciendo el coste de entrenar políticas VLA desde cero.
- Reproducción de resultados académicos: al ser el checkpoint padre de los fine-tunes del artículo, permite replicar y auditar los resultados publicados.
- Desarrollo de políticas VLA personalizadas: investigadores pueden partir de estos pesos y ajustar sobre sus propios conjuntos de datos de manipulación con el pipeline de LeRobot.
- Evaluación comparativa de arquitecturas VLA: proporciona una línea base de 4.400 millones de parámetros con licencia MIT para comparar frente a otras políticas robóticas.
- Prototipado en entornos simulados: útil para validar pipelines de percepción-acción antes de transferir a hardware real.
- Formación y docencia: su formato LeRobot autocontenido facilita demostraciones reproducibles de modelos VLA en cursos de robótica e IA.
- Investigación en unificación cognición-acción: base para estudiar cómo un único modelo de difusión equilibra razonamiento y control motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.447.963.669 parámetros en bf16, se requieren aproximadamente 8,9 GB solo para los pesos; sumando activaciones y buffers del backbone visual y del proceso de difusión, se estima un consumo práctico superior a 12-16 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento y ajuste fino; para inferencia, GPUs con al menos 16-24 GB de VRAM.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) y posiblemente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: LeRobot (carga nativa como política `concertina`); el entrenamiento se lanza con `torchrun --nproc-per-node=8 concertina-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Concertina (este checkpoint) | 4.447.963.669 | No disponible | MIT | Pesos publicados en Hugging Face |
| Bard-VL-B4-Mask-4B-Instruct (modelo base) | ~4B | No disponible | No disponible | Pesos publicados en Hugging Face |
| Otras políticas VLA de la familia LeRobot | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Los conjuntos de datos de preentrenamiento (DROID, AgiBot World, RoboMIND y los 39 datasets en total) no se han publicado, lo que limita la reproducibilidad completa del entrenamiento.
- El checkpoint intermedio de 60.000 pasos no está liberado, por lo que no se puede reentrenar la etapa 1 desde este repositorio.
- No se documentan sesgos conocidos, pero al entrenarse sobre datos de manipulación robótica puede heredar sesgos de esos entornos y tareas.
- Riesgo de alucinación inherente al backbone VLM: las descripciones visuales o instrucciones interpretadas pueden ser incorrectas en escenas fuera de distribución.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en producción con instrucciones largas o multilingües.
- Es un checkpoint de preentrenamiento, no un modelo listo para producción: requiere ajuste fino en tareas concretas (CALVIN, LIBERO u otras) antes de desplegarse.
- No se documentan cuantizaciones alternativas ni soporte para motores de inferencia distintos de LeRobot.
- La licencia MIT permite uso comercial, pero la procedencia de los datos de entrenamiento no publicados puede plantear dudas sobre su cumplimiento en entornos comerciales.
- El número de descargas (6) y likes (0) indica que es un artefacto de investigación reciente con escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Traly/concertina-pretrain-90k
- Modelo base: https://huggingface.co/fudan-generative-ai/Bard-VL-B4-Mask-4B-Instruct
- Cita del artículo (BibTeX en la model card): Wang, C.; He, W.; Li, W.; Li, H.; Han, K.; Guo, J.; Xu, C. "Concertina: Embodying Manipulation and Cognition in One Diffusion Vision-Language Model", 2026.
