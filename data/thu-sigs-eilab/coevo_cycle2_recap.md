# THU-SIGS-EILAB/coevo_cycle2_recap

## Resumen

CoEvo Cycle 2 RECAP teacher es un checkpoint de política robótica (VLA, vision-language-action) desarrollado por THU-SIGS-EILAB, entrenado sobre la arquitectura pi0.5 y publicado a través de la librería openpi. Se trata de la época 5 (paso 8975) de la ejecución `cycle2_step80_self_hil_recap_trainsplit_teacher` con semilla 42, obtenida tras un ajuste fino supervisado (SFT) con RECAP sobre auto-rollouts del Ciclo 2 y toma de control de Cosmos-Policy (HIL automatizado). El modelo parte del estudiante del Ciclo 2 en el paso 80 (`coeva_cycle2_acopd_80`).

El problema que aborda es el de mejorar políticas de manipulación robótica mediante condicionamiento por ventaja (advantage) y señales auxiliares de valor y latente futuro, en lugar de recurrir únicamente a imitación de trayectorias. Su relevancia radica en que actúa como profesor dentro de un esquema CoEvo de destilación: genera etiquetas RECAP y demuestra que el condicionamiento por ventaja y el steering de Cosmos-Policy elevan la tasa de éxito en LIBERO-10 del 65,7% del estudiante base al 81,0-82,9% según la configuración de inferencia.

El modelo cuenta con 4,17 mil millones de parámetros (877 tensores en bf16 y fp32), un repositorio de 8,6 GB y está especializado en tareas de manipulación robótica de LIBERO-10. No se especifican licencia, idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA pi0.5; detalles internos de la arquitectura no especificados en la model card) |
| Parametros totales | 4,17 mil millones (877 tensores, bf16 + fp32) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y fp32) |
| Idiomas soportados | no disponible (tareas de LIBERO-10; idioma de las instrucciones no especificado) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`full_weights.pt`); configuracion en `training_config.yaml` |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, una política VLA del ecosistema openpi (componente "World Pilot"). El checkpoint es el resultado de un ajuste fino completo (full fine-tune, no LoRA) sobre auto-rollouts del Ciclo 2 combinados con toma de control de Cosmos-Policy, un mecanismo de HIL (human-in-the-loop) automatizado. El entrenamiento parte del estudiante del Ciclo 2 en el paso 80 y se ejecuta durante 5 épocas, con 1795 pasos por época, batch global de 64 y una tasa de aprendizaje constante de 2,5e-5 tras el warmup.

La innovación principal es el etiquetado RECAP: se asigna ventaja RECAP con positivos correspondientes al top-30% de progreso bruto, forzando además como positivos los fotogramas de intervención (`recap_n16_raw_top30_iv_exact_all`). El condicionamiento combina latente futuro y steering de valor procedentes de Cosmos-Policy, con un 30% de dropout conjunto de condición durante el entrenamiento, y utiliza RECAP CFG con escala de guía 1,5 y probabilidad incondicional de 0,1. Los datos de entrenamiento son 401 episodios de LIBERO-10 (114.883 fotogramas) del split de entrenamiento, quedando 99 episodios reservados para evaluación. El checkpoint no incluye el estado del optimizador.

## Capacidades

- Control robótico de manipulación: ejecuta políticas vision-language-action sobre tareas de LIBERO-10 (500 episodios por semilla en evaluación).
- Condicionamiento por ventaja RECAP: soporta prompts positivos de RECAP y clasificador libre de guía (CFG) con escala 1,5.
- Steering por latente futuro y valor: puede consultar Cosmos-Policy para obtener condicionamiento z/v durante la inferencia (configuración por defecto activada).
- Operación sin Cosmos-Policy: admite una configuración de inferencia donde se desactiva el steering z/v y Cosmos-Policy no se consulta.
- Función de profesor: genera auto-rollouts y etiquetas de ventaja utilizables para destilar en un estudiante dentro del esquema CoEvo.
- Ajuste fino adicional: al publicarse los pesos completos, es reentrenable sobre datos propios.
- Tool calling / function calling: no disponible.
- Capacidades multilingües, de visión general, audio o thinking mode: no disponibles.

## Casos de uso

- Manipulación robótica en entornos tipo LIBERO-10: el modelo ejecuta políticas de acción directamente sobre observaciones y estado del robot, con tasas de éxito del 81-83% en las configuraciones evaluadas, lo que lo hace adecuado como política de referencia en investigación de manipulación.
- Profesor en destilación CoEvo: al ser un "teacher" RECAP, se usa para generar auto-rollouts y etiquetas de ventaja que alimentan el entrenamiento de estudiantes más pequeños o más rápidos, reduciendo el coste de recolección de datos reales.
- Evaluación de estrategias de condicionamiento: permite comparar configuraciones de inferencia (steering z/v activado o desactivado, CFG 1,0 o 1,5, prompt RECAP o prompt plano) y medir su impacto en la tasa de éxito.
- Investigación en aprendizaje por refuerzo offline: el etiquetado por ventaja RECAP y el condicionamiento por valor sirven como banco de pruebas para métodos de RL sin interacción en tiempo real.
- Fine-tuning para tareas de manipulación propias: los pesos completos permiten reentrenar la política sobre nuevos conjuntos de episodios, reutilizando las estadísticas de normalización incluidas.
- Benchmarking de políticas VLA: sirve como punto de comparación reproducible (semillas 42, 43 y 44; 500 episodios cada una) frente a otras políticas del ecosistema openpi.
- Integración en bucles de HIL automatizado: el modelo ya se entrenó con toma de control Cosmos-Policy, por lo que puede incorporarse a pipelines que combinan intervención automática y supervisada.

## Benchmarks y rendimiento

Evaluación en LIBERO-10, 500 episodios por semilla (datos de la model card):

| Configuracion de inferencia | Semilla 42 | Semilla 43 | Semilla 44 | Media |
|---|---|---|---|---|
| Por defecto: steering z/v activado, RECAP CFG 1,5 | 81,4% | 81,8% | 79,8% | 81,0% |
| z/v desactivado, solo prompt positivo RECAP (CFG 1,0) | 82,8% | 81,6% | 84,2% | 82,9% |
| z/v desactivado, RECAP CFG 1,5 | 82,0% | 79,2% | 78,8% | 80,0% |
| z/v desactivado, prompt de tarea plano (sin RECAP) | 81,8% | 76,2% | 77,4% | 78,5% |
| Baseline: estudiante Ciclo 2 paso 80, prompt plano | 64,4% | 65,8% | 67,0% | 65,7% |

La mejor configuración media corresponde a desactivar el steering z/v y usar únicamente el prompt positivo RECAP con CFG 1,0 (82,9%). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable dado que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada: los 4,17 mil millones de parámetros en bf16 ocupan aproximadamente 8,3 GB; sumando copias en fp32 y el estado de inferencia de openpi, se estima un rango práctico de 12-20 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para ejecución en una sola GPU.
- GPU de consumo: cabe en tarjetas con 24 GB (RTX 3090, RTX 4090); en GPUs de 16 GB puede resultar ajustado y requerir reducir precisión o gestionar memoria con cuidado.
- Opciones de despliegue: la librería oficial es openpi; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI. El repositorio incluye el código en la rama `RECAP` de RLinf_opd.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota de coste adicional: en la configuración por defecto (steering z/v activado) es necesario consultar Cosmos-Policy durante la inferencia, lo que añade carga computacional y latencia frente a las configuraciones con z/v desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | LIBERO-10 (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| coevo_cycle2_recap (este modelo) | 4,17 mil millones | no disponible | 81,0% (por defecto) / 82,9% (mejor) | no disponible | HuggingFace (openpi) |
| Estudiante Ciclo 2 paso 80 (`coeva_cycle2_acopd_80`) | no disponible | no disponible | 65,7% (prompt plano) | no disponible | checkpoint de inicialización |
| pi0.5 base (World Pilot) | no disponible | no disponible | no disponible | no disponible | ecosistema openpi |

No se dispone de datos comparativos de otros modelos VLA de la misma categoría (por ejemplo, pi0, OpenVLA u otros) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue comercial.
- Dominio restringido: el modelo está entrenado y evaluado exclusivamente en LIBERO-10, por lo que su comportamiento fuera de ese conjunto de tareas no está caracterizado.
- Conjunto de evaluación limitado: solo 99 episodios quedan fuera del split de entrenamiento, lo que limita la estimación de la generalización a entornos nuevos.
- Dependencia de Cosmos-Policy: la configuración por defecto requiere consultar Cosmos-Policy en inferencia; desactivarla es posible, pero cambia el perfil de rendimiento y exige reconfigurar el pipeline.
- Riesgo de sobreajuste al esquema RECAP: el rendimiento depende del condicionamiento por ventaja y del prompt RECAP; con prompt plano la media baja al 78,5%.
- Variabilidad entre semillas: los resultados por semilla oscilan entre el 76,2% y el 84,2% según la configuración, lo que aconseja evaluar con múltiples semillas antes de sacar conclusiones.
- Reproducibilidad parcial: el checkpoint no incluye el estado del optimizador, por lo que no permite reanudar el entrenamiento exactamente donde se dejó.
- Idiomas y contexto: no disponibles; no se puede asumir soporte multilingüe ni un contexto largo.
- Sesgos: no se han documentado sesgos específicos en la información disponible, pero tampoco se han publicado análisis al respecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/THU-SIGS-EILAB/coevo_cycle2_recap
- Código: rama `RECAP` del repositorio RLinf_opd (no se proporciona URL directa)
- Configuración de entrenamiento: `examples/sft/config/cycle2_step80_self_hil_recap_trainsplit_6ep.yaml` (dentro del repositorio de código)
- Resultados de evaluación por ejecución: carpeta `eval/` del repositorio del modelo
- Estadísticas de normalización: `physical-intelligence/libero/norm_stats.json` del repositorio del modelo
- La búsqueda web no ha devuelto enlaces relevantes adicionales (papers, blogs o demos) sobre este modelo.
