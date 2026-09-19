# wckwan/Alfworld-Qwen3-8B-SEED

## Resumen

Alfworld-Qwen3-8B-SEED es un ajuste fino de Qwen3-8B desarrollado por el usuario wckwan (repositorio `wckwan/Alfworld-Qwen3-8B-SEED`) sobre el entorno de agentes ALFWorld, entrenado con la receta SEED en su variante "direct-to-RL", sin etapa previa de SFT de habilidades retrospectivas (hindsight-skill SFT). No es un modelo de chat generalista: es una política (actor) para resolver tareas domésticas interactivas en texto, distribuida como una serie de checkpoints intermedios exportados en formato HuggingFace (`merged_hf_actor_gs<N>/`) cada 20 pasos de entrenamiento, hasta un total de 400 pasos.

Su relevancia es metodológica más que de producto. La propia model card documenta que esta variante es un "SEED parcial, no limpio": el paso de análisis de la receta falla en una fracción grande de trayectorias (entre el 10,2 % y el 43,8 % por paso en los primeros 125 pasos, con 20-34 % agregado), y las trayectorias cuyo análisis falla reciben máscara OPD cero y se entrenan como RL de resultado puro. En consecuencia, una parte sustancial de este brazo es GRPO ordinario disfrazado de SEED, lo que contamina cualquier comparación SEED frente a GRPO o GiGPO hecha con estos pesos.

El repositorio ocupa 229,4 GB e incluye un `MANIFEST.sha256` con el hash de cada archivo exportado. No declara licencia, idiomas ni pipeline, y no hay resultados de benchmarks en held-out publicados: la model card retracta explícitamente las cuatro filas que se circularon como evidencia de generalización porque se generaron en una sede (UCL) distinta a la del resto de la serie (EIDF), sobre una muestra de 128 episodios diferente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, heredada de Qwen3-8B (no se detalla en la ficha del autor) |
| Parametros totales | Aproximadamente 8,2 B (modelo base Qwen3-8B); no confirmado en la ficha del autor |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha del autor; la del modelo base Qwen3-8B es de 32.768 tokens nativos, ampliable a 131.072 con YaRN |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors, presumiblemente en bf16 |
| Idiomas soportados | No disponible en la ficha; el entorno ALFWorld y las trayectorias de entrenamiento están en inglés |
| Licencia | No disponible en la ficha del autor; el modelo base Qwen3-8B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (exportaciones `merged_hf_actor_gs<N>/`); 229,4 GB de repositorio, con `MANIFEST.sha256` en la raíz |
| Pasos de entrenamiento | 400, con `save_freq` 20 (checkpoints cada 20 pasos) |
| Tarea de entrenamiento | ALFWorld (agente textual de tareas domésticas) |
| Tamano del grupo (rollout) | 8 |
| Hardware de entrenamiento | 4x H100 80 GB |
| Configuracion de memoria | micro-batch de actor 4, micro-batch de log-prob 16, `vLLM` 0.50 de uso de memoria de GPU |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-8B, un transformer denso de aproximadamente 8,2 B de parámetros. Sobre él se aplica un entrenamiento de RL directo ("direct-to-RL") con la receta SEED, sin la etapa intermedia de SFT de habilidades retrospectivas que normalmente caracteriza a esta familia de métodos. El entrenamiento se ejecuta durante 400 pasos con tamaño de grupo 8 sobre 4 GPUs H100 de 80 GB, con micro-batches de actor 4 y de log-prob 16, y un límite de memoria de 0.50 para el motor vLLM encargado del rollout. La model card advierte que los valores por defecto del lanzador (8/16/0.65) son valores para H200 y provocan OOM en tarjetas de 80 GB. `PYTORCH_CUDA_ALLOC_CONF` se deja deliberadamente sin definir.

La innovación documentada no es arquitectónica sino metodológica, y en este caso negativa. El paso de análisis de SEED debía extraer una "habilidad" utilizable de cada trayectoria; de los 91 fallos registrados, 86 corresponden a "la respuesta del analizador SEED no contenía una habilidad utilizable" y solo 5 a errores de parseo JSON. El profesor devuelve JSON bien formado, pero un filtro permisivo (no vacío, no puntos suspensivos, al menos tres palabras) rechaza sus habilidades. Todas las trayectorias eran elegibles (`seed/eligible_traj_frac` = 1.000) y el profesor estaba en alcance (`seed/teacher_rows_outside_scope` = 0 en todos los pasos), de modo que el problema está en el filtro, no en la elegibilidad. El análisis de correlaciones sobre 2.560 trayectorias de los primeros 20 pasos muestra que el fallo se concentra en episodios cortos (r = -0,577 con la longitud; 19,1 pasos de media frente a 42,8), y como en ALFWorld los episodios cortos son mayoritariamente los exitosos (r = -0,895), la señal del profesor se pierde justo donde la política ya funciona bien. Al controlar por longitud, la asociación con el éxito cae de +0,598 a +0,223.

## Capacidades

- Ejecución de políticas de agente en entornos textuales interactivos: selección de acciones paso a paso en ALFWorld durante episodios que promedian 19,1-42,8 pasos según el caso.
- Razonamiento multi-paso con estado parcialmente observable: el modelo debe mantener el objetivo y el inventario a lo largo de decenas de turnos.
- Generación de trayectorias completas (rollouts) utilizables para evaluación y para generación de datos sintéticos de agente.
- Aprendizaje por refuerzo sobre recompensa de resultado: la señal de entrenamiento es el éxito del episodio, no la preferencia humana.
- Soporte de tool calling / function calling: no disponible; el modelo emite acciones sobre el vocabulario del entorno, no llamadas a herramientas en formato estándar.
- Capacidades multilingües: no disponible; el entorno de entrenamiento está en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponible; no hay evidencia en la ficha de ninguna de ellas.
- Uso como política servida por vLLM: el propio pipeline de entrenamiento usa vLLM 0.50 para el rollout, por lo que el checkpoint es directamente servible en ese motor.

## Casos de uso

- Investigación en recetas de RL para agentes: servir como brazo "SEED parcial" frente a los brazos limpios del mismo programa (ALFWorld x OLMo-3-7B, WebShop x Qwen3-8B) para estudiar cuánto degrada la dilución de señal. La model card indica que cualquier diferencia observada debe interpretarse como cota inferior de lo que mostraría un SEED limpio.
- Auditoría de fallos de analizadores de habilidad: reproducir el análisis por trayectoria (correlaciones con éxito y longitud, tasa de fallo por tramos de 25 pasos) para diagnosticar filtros de habilidades demasiado permisivos en pipelines SEED.
- Evaluación de agentes en ALFWorld: desplegar el checkpoint con vLLM y ejecutar el pool de 140 juegos, prestando atención al script `scripts/check_result_alfworld.py`, que fija las colas de los diez primeros gamefiles y permite verificar la identidad de la tarea antes de comparar estadísticos de resultado.
- Estudio de curvas de aprendizaje: los 20 checkpoints cada 20 pasos permiten trazar la evolución del éxito de episodio (0,434 a 0,644 en los primeros 125 pasos) y cruzarla con la tasa de fallo de análisis, que sube del 20,8 % al 31,3 % al mejorar la política.
- Punto de partida para RL posterior: los exports "merged" son cargables como actor en un entrenamiento continuado, útil para probar si un filtro de habilidades corregido recupera la señal perdida en las trayectorias cortas.
- Generación de trayectorias sintéticas para destilación: los rollouts del checkpoint pueden usarse como datos de entrenamiento de políticas más pequeñas, con el caveat de que las trayectorias exitosas cortas están infrarrepresentadas en la señal de profesor.
- Validación de infraestructura de entrenamiento: sirve como caso de prueba de configuraciones de memoria en H100 80 GB (4/16/0.50) frente a H200, útil para equipos que calibran lanzadores de RL.
- Arbitraje de comparaciones entre sedes: dado el episodio de las filas retractadas, el checkpoint es un caso de estudio para implementar controles de identidad de tarea antes de cualquier estadístico de resultado, en lugar de controles de banda calibrados a ruido de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en held-out en la informacion disponible. La model card declara explícitamente que no existe una medición válida de generalización y que las cuatro filas que se circularon como evidencia (gs60, gs80, gs120, gs140) fueron retractadas. Lo único medible publicado son métricas sobre la distribución de entrenamiento:

| Tramo de pasos | Tasa de fallo de analisis | Exito de episodio |
|---|---|---|
| 1-25 | 26,3 % | 0,434 |
| 26-50 | 22,4 % | 0,508 |
| 51-75 | 21,3 % | 0,564 |
| 76-100 | 20,8 % | 0,594 |
| 101-125 | 31,3 % | 0,644 |

Comparativa de la tasa de fallo de análisis entre celdas del mismo programa:

| Celda | Tasa de fallo de analisis |
|---|---|
| ALFWorld x Qwen3-8B (este brazo) | 20-34 % |
| ALFWorld x OLMo-3-7B | por debajo del 1 % en los primeros pasos |
| WebShop x Qwen3-8B | cerca del 0 % |
| WebShop x OLMo-3-7B | 1-5 % tras el paso 1 |

Correlaciones por trayectoria (2.560 trayectorias de los primeros 20 pasos):

| Correlacion | Valor |
|---|---|
| r(fallo de analisis, exito de episodio) | +0,598 |
| r(fallo de analisis, longitud de episodio) | -0,577 |
| r(exito de episodio, longitud de episodio) | -0,895 |
| r parcial(fallo, exito \| longitud) | +0,223 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16, aproximadamente 16-17 GB solo para el modelo; el repositorio completo ocupa 229,4 GB porque incluye todos los checkpoints exportados, no porque el modelo en sí los necesite.
- GPU recomendadas: A100 80 GB, H100 80 GB (el entrenamiento se hizo en 4x H100 80 GB), o cualquier GPU con 24 GB o más para inferencia en bf16.
- Cabe en GPU de consumo: sí, en una RTX 4090 o RTX 3090 de 24 GB en bf16, dejando margen para caché KV; en GPUs de 12-16 GB requeriría cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: vLLM es la opción natural, ya que el propio entrenamiento usó vLLM 0.50 para el rollout; también son viables TGI o llama.cpp/Ollama previa conversión a GGUF, que el autor no proporciona.
- Restricciones de memoria del lanzador: en tarjetas de 80 GB hay que usar micro-batch de actor 4, micro-batch de log-prob 16 y límite de vLLM 0.50; los valores por defecto 8/16/0.65 provocan OOM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los únicos comparables documentados en la información disponible son las celdas hermanas del mismo programa de investigación, no modelos públicos independientes.

| Modelo | Parametros | Entorno | Tasa de fallo de analisis | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Alfworld-Qwen3-8B-SEED | ~8,2 B | ALFWorld | 20-34 % | no disponible | HuggingFace, 0 descargas, 0 likes |
| ALFWorld x OLMo-3-7B | ~7 B | ALFWorld | por debajo del 1 % en los primeros pasos | no disponible | celda del mismo programa, no publicada como repo independiente en la informacion disponible |
| WebShop x Qwen3-8B | ~8,2 B | WebShop | cerca del 0 % | no disponible | celda del mismo programa |
| Qwen3-8B (modelo base) | ~8,2 B | no aplica | no aplica | Apache 2.0 | publico en HuggingFace |

No hay comparación posible en benchmarks de held-out, porque ninguna de estas celdas tiene mediciones válidas publicadas según la propia model card.

## Limitaciones y advertencias

- Contaminación metodológica: entre el 20 % y el 34 % de las trayectorias no reciben señal de profesor y se entrenan como GRPO puro. Por recuento de trayectorias, una parte sustancial de este brazo no es SEED.
- La dilución empeora con el entrenamiento: la tasa de fallo de análisis bajó hasta el paso 100 y luego subió al 31,3 %, porque las políticas mejores producen más episodios cortos y exitosos, que son justo los que el analizador no sabe describir.
- Señal sesgada hacia el fracaso: el análisis falla sobre todo en episodios cortos (19,1 pasos de media frente a 42,8), que en ALFWorld son mayoritariamente los exitosos. El modelo aprende menos de sus propios aciertos rápidos.
- Ausencia total de validación de generalización: no hay medición held-out válida. El éxito en la distribución de entrenamiento no puede detectar daño por dilución.
- Filas retractadas: gs60, gs80, gs120 y gs140 se produjeron en UCL mientras gs20, gs40 y gs100 se produjeron en EIDF; las dos sedes muestrean 128 episodios distintos y en distinto orden del mismo pool de 140 juegos, y las filas de UCL fallan la comprobación de colas de gamefile desde la ranura 5. No se pueden leer unas contra otras.
- Control de sede defectuoso: el control existente comparó 71/128 contra 79/128 como si midieran los mismos juegos y devolvió PASS. La identidad de tarea debe comprobarse antes de cualquier estadístico de resultado, nunca en paralelo.
- Riesgo de alucinación: no disponible como métrica; al ser una política de acciones sobre un entorno, el modo de fallo relevante es la acción inválida o el bucle, no la fabulación de hechos.
- Licencia sin declarar: la ficha del autor no especifica licencia, lo que impide asumir derechos de uso comercial aunque el modelo base Qwen3-8B sea Apache 2.0. Verificar antes de cualquier uso en producción.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas declarados.
- Tamaño del repositorio: 229,4 GB, lo que exige planificar el almacenamiento si se quieren todos los checkpoints.
- Uso esperado restringido: es una política de agente entrenada en inglés sobre ALFWorld; no debe tratarse como un modelo de chat o de propósito general.

## Enlaces

- HuggingFace: https://huggingface.co/wckwan/Alfworld-Qwen3-8B-SEED
- Manifest de integridad: `MANIFEST.sha256` en la raíz del repositorio (lista todos los archivos de cada export)
- Script de verificación de evaluación: `scripts/check_result_alfworld.py` (fija las colas de los diez primeros gamefiles y valida la identidad de la tarea)
- Modelo base: Qwen3-8B, https://huggingface.co/Qwen/Qwen3-8B (licencia Apache 2.0)
- Paper, blog o demo del autor: no disponible
- Busquedas web realizadas: no devolvieron resultados relevantes sobre este modelo (unicamente paginas corporativas de Microsoft sin relacion con la ficha)
