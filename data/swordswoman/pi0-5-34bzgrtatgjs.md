# swordswoman/pi0.5-34bZGrtATgJs

## Resumen

pi0.5-34bZGrtATgJs es un checkpoint de robótica publicado por el usuario swordswoman dentro del ecosistema OpenRoboto, concretamente para la temporada 1 de la pista real (real-track). Se trata de un ajuste fino del checkpoint base 0xjulius/pi05-3cYofFKyNaP2, que fue el campeón de la temporada 1 de simulación de OpenRoboto. El modelo pertenece a la familia pi0.5, un tipo de modelo visión-lenguaje-acción (VLA) orientado a generar políticas de control robótico a partir de observaciones visuales e instrucciones en lenguaje natural.

A pesar de que el identificador incluye la cadena "34b", el recuento real de parámetros almacenados en el fichero safetensors es de 3.616.757.520 (aproximadamente 3,62 mil millones), por lo que no se corresponde con un modelo de 34.000 millones. El repositorio ocupa 7,2 GB y los pesos se distribuyen en bfloat16 con el layout PyTorch de openpi.

El modelo es relevante como pieza de investigación dentro de OpenRoboto y del benchmark LIBERO, ya que documenta un procedimiento reproducible de ajuste con LoRA sobre datos de demostración y estadísticas de normalización heredadas del checkpoint base. El propio autor advierte de que no se reclama ningún rendimiento en robot real y que únicamente se ha superado la comprobación de formato local del checkpoint pi0.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) de la familia pi0.5, en layout PyTorch de openpi; detalle interno de capas no disponible |
| Parametros totales | 3.616.757.520 (≈3,62 B) |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16, layout PyTorch de openpi); incluye config.json, round_info.json y assets/physical-intelligence/libero/norm_stats.json |

## Arquitectura y entrenamiento

El checkpoint se construye sobre 0xjulius/pi05-3cYofFKyNaP2 (revisión b75495c2b3c4c93e18dc91f2fd24d6a8c1270dbc), descrito como campeón de la temporada 1 de simulación de OpenRoboto. El ajuste fino consistió en 100 pasos de LoRA con rango 16 en el backbone y rango 32 en el experto de acción, entrenados sobre los datos de demostración de LIBERO. Se reutilizaron las estadísticas de normalización propias del checkpoint base (norm_stats.json sin modificar) y los adaptadores se fusionaron de vuelta en los pesos densos, de modo que el resultado es un único conjunto de pesos bfloat16 listo para inferencia.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO. La única innovación documentada es el uso de LoRA asimétrico (mayor rango en el experto de acción que en el backbone) combinado con las estadísticas de normalización del modelo base. El autor indica que el checkpoint superó la comprobación local de formato de pi0.5, pero no aporta métricas de éxito ni de generalización.

## Capacidades

- Generación de acciones de control robótico a partir de entradas multimodales (visión y lenguaje), propio de los modelos VLA de la familia pi0.5.
- Ejecución de políticas de manipulación entrenadas sobre el benchmark LIBERO.
- Ajuste fino adicional sobre dominios concretos mediante LoRA, tal como se documenta en la propia ficha.
- Integración con el ecosistema openpi (formato de pesos y convenciones de normalización compatibles).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión general, audio): no disponible más allá del uso robótico previsto.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: el modelo sirve como política de referencia para reproducir experimentos del benchmark y comparar variantes de ajuste fino.
- Punto de partida para fine-tuning con LoRA: al haberse entrenado solo 100 pasos de LoRA fusionados, es un candidato directo para continuar el ajuste sobre nuevos conjuntos de demostraciones sin partir del checkpoint base.
- Evaluación de pipelines de simulación: puede desplegarse en entornos simulados compatibles con pi0.5 para validar protocolos de control antes de transferir a hardware.
- Experimentos de sim-to-real: dado que no se reclama rendimiento en robot real, su uso natural es como sujeto de pruebas para medir la brecha entre simulación y realidad.
- Reproducción de competiciones OpenRoboto: encaja como checkpoint de la pista real de la temporada 1, permitiendo replicar o auditar los resultados de la competición.
- Estudio de estadísticas de normalización heredadas: al conservar norm_stats.json del modelo base, es útil para analizar cómo afecta la normalización al ajuste fino con pocos pasos.
- Integración en herramientas del ecosistema openpi: sirve para probar cargadores, conversores de formato y utilidades de inspección de checkpoints VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún rendimiento en robot real y que solo se ha superado la comprobación local de formato del checkpoint pi0.5.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 7-8 GB en bfloat16, coherente con un repositorio de 7,2 GB; con cuantizacion a 8 bits podría reducirse a unos 4 GB y a 16 bits a 2-3 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para experimentación a gran escala; RTX 4090, RTX 3090 o RTX A6000 son suficientes para una única instancia en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en bfloat16 (por ejemplo RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090); en GPUs con menos memoria sería necesario cuantizar.
- Opciones de despliegue: el formato declarado es el layout PyTorch de openpi, por lo que el despliegue natural es a través de las utilidades de openpi; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y estos motores no están orientados a políticas VLA de este tipo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swordswoman/pi0.5-34bZGrtATgJs | 3,62 B | no disponible | no publicado (sin validacion en robot real) | no disponible | HuggingFace |
| 0xjulius/pi05-3cYofFKyNaP2 (base) | no disponible | no disponible | campeon de la temporada 1 de simulacion de OpenRoboto (segun la model card) | no disponible | HuggingFace |
| Otros VLA comparables (por ejemplo, pi0, RDT-1B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no puede asumirse uso comercial sin consultar al autor.
- No se han publicado benchmarks ni métricas de éxito; el autor declara explícitamente que no reclamó ningún rendimiento en robot real.
- El ajuste fino se limita a 100 pasos de LoRA, lo que reduce el alcance de la especialización y aumenta el riesgo de sobreajuste a los datos de LIBERO.
- El identificador incluye "34b" pese a tener 3,62 mil millones de parámetros, lo que puede inducir a error sobre el tamaño real del modelo.
- Se desconocen los idiomas soportados y la longitud de contexto, lo que dificulta planificar su integración en pipelines de lenguaje natural.
- El modelo está pensado para robótica y no como asistente conversacional general; no hay evidencia de soporte de tool calling, agentes o razonamiento multi-paso.
- Al depender de librerías y convenciones de openpi, la reproducibilidad queda condicionada a versiones concretas del ecosistema y a las estadísticas de normalización heredadas.
- Es un repositorio sin descargas ni interacciones, por lo que no existe validación externa de su funcionamiento.
- La fecha de creación registrada (2026) y la ausencia de documentación adicional obligan a tratar cualquier afirmación de rendimiento con cautela.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swordswoman/pi0.5-34bZGrtATgJs
- Checkpoint base (OpenRoboto, temporada 1 de simulación): https://huggingface.co/0xjulius/pi05-3cYofFKyNaP2
- Búsqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos correspondían a la herramienta Digipad de La Digitale y no guardan relación con el checkpoint.
