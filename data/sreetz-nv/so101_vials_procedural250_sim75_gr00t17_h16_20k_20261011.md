# sreetz-nv/so101_vials_procedural250_sim75_gr00t17_h16_20k_20261011

## Resumen

El modelo `sreetz-nv/so101_vials_procedural250_sim75_gr00t17_h16_20k_20261011` es una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino supervisado de `nvidia/GR00T-N1.7-3B`. Lo desarrolla Shane Reetz (organización `sreetz-nv`, vinculada a NVIDIA) y su propósito es evaluar si combinar demostraciones scriptadas con variación procedural y episodios de teleoperación simulada mejora las conductas de recogida de viales y colocación en gradillas sobre un brazo SO-101. Cuenta con 3.144.016.000 parámetros (unos 3,14 mil millones) y se distribuye a través de la librería LeRobot en formato safetensors, con un repositorio de 12,6 GB.

El entrenamiento se realizó íntegramente en simulación: 250 episodios procedurales con domain randomization y 75 episodios de teleoperación simulada, sumando 325 episodios y 113.200 fotogramas. No se empleó ningún dato de robot real. El ajuste consistió en 20.000 actualizaciones del optimizador con un horizonte de acción supervisado de 16 pasos, batch global efectivo de 64 y un backbone de visión entrenable junto con un backbone de lenguaje congelado.

La relevancia de esta ficha es doble. Por un lado, documenta una receta reproducible de ajuste fino de GR00T N1.7 sobre un brazo de bajo coste con datos exclusivamente sintéticos. Por otro, el propio autor advierte de que el checkpoint no incluye evaluación en simulación ni en robot físico, y de que no demuestra transferencia al mundo real, robustez ante posiciones iniciales no vistas ni fiabilidad en ciclos repetidos. Es, por tanto, un artefacto de investigación, no un modelo listo para producción robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de `nvidia/GR00T-N1.7-3B`; la model card no detalla la arquitectura interna más allá de la separación entre backbone de visión y backbone de lenguaje |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados parecen estar en precisión completa (12,6 GB para 3,14 B parámetros) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |
| Modelo base | `nvidia/GR00T-N1.7-3B`, revisión `2fc962b973bccdd5d8ce4f67cc63b264d6886495` |
| Pipeline declarado | robotics |
| Tamaño del repositorio | 12,6 GB |
| Fecha de creación | 2026-10-11 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Lo que sí especifica es que se trata de un ajuste fino de `nvidia/GR00T-N1.7-3B`, un modelo de la familia GR00T orientada a robótica, y que durante el entrenamiento el backbone de visión permaneció entrenable mientras que el backbone de lenguaje se congeló. Esto implica que la adaptación al dominio SO-101 se produjo en la torre visual y en las cabezas de acción, no en la representación lingüística. El modelo exportado incluye su preprocesador y postprocesador de política, de modo que la entrada y la salida de acciones quedan encapsuladas en el artefacto.

El entrenamiento es de imitación supervisada, no de refuerzo: no se menciona RLHF, DPO ni ningún otro ajuste por preferencias. Se realizaron 20.000 actualizaciones del optimizador con Adam y un learning rate de `1e-4`, 1.000 actualizaciones de warmup y schedule coseno, hasta un learning rate final de cero. El batch global efectivo fue de 64, implementado como microbatch de 16 con cuatro pasos de acumulación de gradiente sobre una única GPU. El horizonte de acción supervisado fue de 16, es decir, el modelo predice bloques de 16 acciones por paso de inferencia (action chunking). La semilla fue 42.

Los datos provienen exclusivamente de simulación. El subconjunto procedural (`liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009`, revisión `b9018e0...`) aporta 250 episodios con layouts procedurales y domain randomization; el subconjunto de teleoperación simulada (`sreetz-nv/so101_sim_manual_perception_newton_20261008`, revisión `4137a62...`) aporta 75 episodios. El total combinado es de 325 episodios y 113.200 fotogramas, muestreados a su frecuencia natural. El autor indica que la exportación fusionada se auditó verificando igualdad numérica exacta con los datasets de origen y coincidencia de hash de los vídeos copiados. Las dos fuentes tienen distribuciones de pose inicial distintas, un detalle relevante para interpretar cualquier evaluación posterior.

## Capacidades

- Generación de acciones de control robótico: produce secuencias de acciones (chunks) de hasta 16 pasos, orientadas a manipulación de precisión sobre el brazo SO-101.
- Percepción visual guiada por lenguaje: al conservar el backbone de lenguaje del modelo base y mantener entrenable el de visión, el modelo puede condicionar el comportamiento en observaciones visuales y en la instrucción heredada de GR00T N1.7.
- Recogida de viales: la tarea principal para la que fue entrenado es el agarre y levantamiento de viales en entornos simulados.
- Colocación en gradillas: la segunda tarea del flujo es depositar los viales en gradillas con layouts variables.
- Robustez a variación de layout: el subconjunto procedural con domain randomization busca generalizar a disposiciones de objetos no idénticas a las vistas.
- Ejecución de políticas multi-paso: el horizonte de 16 acciones permite control en lazo abierto durante tramos cortos entre replanificaciones.
- Tool calling, function calling, agentes, matemáticas, código y capacidades multilingües: no disponible; la model card no documenta ninguna de estas capacidades, y el modelo está especializado en control robótico.
- Modo de razonamiento explícito, visión conversacional o audio: no disponible.

## Casos de uso

- Investigación en ajuste fino de políticas VLA: el checkpoint sirve como punto de partida reproducible para estudiar cómo cambia el rendimiento al variar la mezcla de datos scriptados y teleoperados, ya que la receta, la semilla y las revisiones de dataset están documentadas.
- Generación de datos sintéticos para robótica: permite ejecutar políticas en simulador para producir trayectorias adicionales y estudiar estrategias de aumentación antes de recoger datos reales con el SO-101.
- Evaluación de domain randomization: al haberse entrenado con layouts procedurales, es un banco de pruebas natural para medir cuánta variación de disposición tolera una política sin degradarse.
- Estudio de transferencia sim-to-real: el autor recomienda explícitamente evaluar partiendo de una pose inicial registrada de cada grupo de datos y registrar la pose alcanzada antes de aplicar acciones, lo que convierte al modelo en una pieza útil para protocolos de transferencia.
- Comparación de estrategias de congelación de backbones: dado que la torre de lenguaje está congelada y la visual no, el modelo permite analizar el coste y el beneficio de entrenar solo una parte del sistema en tareas de manipulación.
- Integración en pipelines educativos de robótica con LeRobot: al distribuirse con la librería LeRobot y el brazo SO-101, encaja en cursos y talleres donde se enseña a desplegar políticas sobre hardware de bajo coste.
- Referencia negativa o línea base: útil como punto de comparación frente a políticas entrenadas con datos reales, ya que su rendimiento real no está validado y sirve para cuantificar la brecha sim-to-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que todavía no se incluyen resultados de evaluación ni en simulación ni en robot físico, y que la evaluación debería partir de una pose inicial exacta registrada del grupo de datos correspondiente. Tampoco se proporcionan métricas de tasa de éxito, precisión de agarre ni tiempos de ciclo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 12,6 GB en el repositorio, lo que corresponde a 3,14 B parámetros en precisión de 32 bits. En bf16 o fp16 la huella de pesos bajaría a unos 6,3 GB; con overhead de activaciones y buffers visuales, cabe esperar del orden de 8 a 10 GB en bf16.
- GPU recomendadas: para inferencia en precisión completa, GPU de 24 GB o más (RTX 3090, RTX 4090, L4, A10G, A100 40 GB, H100). En bf16 el modelo es viable en GPU de 12 a 16 GB.
- Cabe en GPU de consumo: sí, en bf16 o fp16 en tarjetas de 16 GB o más (RTX 4080, RTX 4060 Ti 16 GB, RTX 4090). En fp32 requiere una GPU de 24 GB o superior.
- Entrenamiento y ajuste fino: la configuración reportada usa microbatch 16 con acumulación de 4 sobre una sola GPU y backbone de visión entrenable. La model card no especifica qué GPU se utilizó; para reproducir ese régimen es razonable esperar hardware de clase A100 o H100, aunque el dato no está confirmado.
- Opciones de despliegue: LeRobot es la librería declarada y el modelo se exporta con preprocesador y postprocesador de política. El soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y no se puede asumir.
- Latencia y throughput: no disponible. La model card no publica cifras de frecuencia de control, latencia por chunk ni tasa de éxito.

## Comparativa con modelos similares

Los datos de parámetros y licencias de los modelos de la columna de comparación provienen de documentación pública general y no de la información proporcionada en esta búsqueda; conviene verificarlos en sus repositorios antes de citarlos.

| Modelo | Parametros | Tipo | Contexto / horizonte de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SO-101 GR00T N1.7 h16) | 3,14 B | VLA para SO-101 | horizonte de acción 16 | no disponible | HuggingFace, librería LeRobot |
| `nvidia/GR00T-N1.7-3B` | ~3 B | VLA generalista de NVIDIA | no disponible | no disponible | HuggingFace |
| OpenVLA | ~7 B | VLA para manipulación | no disponible | licencia de tipo Llama 2 (verificar) | HuggingFace |
| SmolVLA | ~0,45 B | VLA compacta | no disponible | Apache 2.0 (verificar) | HuggingFace |

No hay datos de rendimiento comparado publicados para este checkpoint, por lo que la comparativa se limita a parámetros, tipo de modelo y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay resultados en simulación ni en robot físico. Cualquier afirmación sobre su rendimiento carece de respaldo empírico.
- Entrenamiento exclusivamente sintético: no contiene ningún dato de robot real, por lo que no demuestra por sí mismo transferencia sim-to-real.
- Robustez no demostrada: el modelo no acredita comportamiento de recuperación ante fallos, tolerancia a posiciones iniciales no vistas ni fiabilidad en ciclos repetidos.
- Distribuciones de inicio heterogéneas: los subconjuntos scriptado y de teleoperación tienen distribuciones de poses iniciales distintas. El autor advierte que una única pose de arranque no permite establecer el rendimiento sobre ambos grupos, y que los resultados obtenidos fuera de las distribuciones de entrenamiento deben reportarse aparte como ensayos fuera de distribución.
- Seguridad física: la model card señala que los pesos no establecen un funcionamiento seguro o fiable sobre un robot físico. Antes de cualquier uso real es obligatorio verificar el orden y las unidades de las articulaciones, la calibración del gripper, la identidad de las cámaras, el horizonte de ejecución de acciones, la revisión del runtime y los límites de seguridad.
- Licencia no disponible: no se especifica la licencia, por lo que no puede asumirse permiso para uso comercial ni para redistribución. Al derivar de `nvidia/GR00T-N1.7-3B`, las condiciones del modelo base pueden aplicar adicionalmente.
- Idiomas y contexto no documentados: se desconoce el soporte multilingüe y la longitud de contexto, algo relevante si se pretende usar instrucciones en castellano o secuencias largas.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; en modelos de acción se traduce en trayectorias plausibles pero incorrectas, con riesgo de colisión o de daño al material de laboratorio.
- Datos de autoría: el autor declarado es Shane Reetz dentro de la organización `sreetz-nv`. La model card no documenta sesgos de los datasets de origen, composición demográfica ni diversidad de condiciones de iluminación más allá del domain randomization del subconjunto procedural.
- Cero tracción en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni terceros que hayan reproducido los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sreetz-nv/so101_vials_procedural250_sim75_gr00t17_h16_20k_20261011
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset procedural: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_dr_procedural_layout_aware_250ep_20261009
- Dataset de teleoperación simulada: https://huggingface.co/datasets/sreetz-nv/so101_sim_manual_perception_newton_20261008
- Librería LeRobot: no disponible en los resultados de búsqueda
- Paper, blog o demo del autor: no disponible en los resultados de búsqueda
- La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces encontrados correspondían a contenido no pertinente y se han descartado.
