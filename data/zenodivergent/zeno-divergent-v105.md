# ZenoDivergent/zeno-divergent-v105

## Resumen

Zeno v1.05 unified es un modelo de meta-previsión (model-of-models) desarrollado por Zeno Divergent. No es un modelo generativo de lenguaje, sino un sistema que recibe un panel de previsiones procedentes de múltiples fuentes (modelos meteorológicos, hubs epidemiológicos, encuestas profesionales, mercados de predicción, agentes de IA) sobre una misma pregunta y devuelve una respuesta corregida, una decisión de "confiar, ajustar o abstenerse" y una alerta temprana cuando el consenso completo tiende a fallar de forma conjunta.

El modelo se distribuye como un paquete de pesos en safetensors y ONNX (aproximadamente 0,7 GB de repositorio), con código de servicio propio incluido en `zeno_core/`. La versión v1.05 actúa como enrutador: dirige cada campo a la versión que mejor se comportó en pruebas honestas en el tiempo (v1.04, v1.03 o v1.01), de modo que ningún campo queda servido por una versión con peor rendimiento medido.

La relevancia actual radica en su enfoque de "inteligencia de la sorpresa": detecta cuándo el consenso de un panel de previsiones está a punto de equivocarse, un problema crítico en operaciones meteorológicas, gestión de redes eléctricas, salud pública y riesgo de mercados. Se distribuye bajo licencia Apache 2.0 y se presenta explícitamente como una vista previa de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (sistema de meta-previsión con enrutador por campo; pesos en safetensors y ONNX) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

La arquitectura concreta (tipo de red, número de capas, dimensiones) no se detalla en la información disponible. El sistema se organiza como un "modelo de modelos": recibe paneles de previsiones con cuantiles (q05, q50, q95) por forecaster, aplica un enrutador por campo (`routing.json`) que selecciona la versión de modelo adecuada (v1.04, v1.03 o v1.01) y produce una distribución corregida, una decisión de abstención y alertas de fallo conjunto por familia.

El entrenamiento cubre 13 campos de forma conjunta: meteorología, energía, salud pública, economía, cripto, mercados de predicción y ForecastBench, entre otros. La model card indica que cada ejecución de entrenamiento verifica que consumió todos los campos. La validación es "honesta en el tiempo": cada campo se evalúa en sus semanas más recientes tras un hueco temporal, con resultados de otros campos purgados. No se especifican el número de tokens, la composición exacta del dataset ni si se emplearon RLHF o DPO, dado que no es un modelo de lenguaje.

Una innovación destacable es el tratamiento de copias: los pronosticadores de la misma familia o copias exactas no pueden superar en voto a los independientes. Además, el modelo emite una advertencia de fallo conjunto cuando todas las familias independientes tienden a errar a la vez, que es precisamente el momento en que el consenso resulta más peligroso.

## Capacidades

- Meta-previsión sobre paneles de pronósticos: corrección de la respuesta agregada a partir de múltiples previsiones cuantílicas.
- Decisión de "confiar, ajustar o abstenerse" (abstain) según la fiabilidad estimada del panel.
- Alerta temprana de fallo conjunto por familia de pronosticadores (`joint_family_warning`).
- Advertencia a nivel de panel (`panel_warning`) sobre la calidad del consenso.
- Enrutamiento automático por campo a la versión con mejor rendimiento medido.
- Soporte de 13 campos: meteorología, energía, salud pública, economía, cripto, mercados de predicción, ForecastBench, entre otros.
- Inferencia vía HTTP (API pública), MCP (para agentes como Claude, ChatGPT o Cursor), Python con safetensors y ONNX Runtime.
- Procesamiento por lotes de hasta 25 paneles en la API MCP.
- Los campos no entrenados se responden como "no probados", nunca se adivinan.

## Casos de uso

- Operaciones meteorológicas y de incendios: introducir las salidas de varios modelos meteorológicos (por ejemplo, máximas aeroportuarias de ECMWF) y obtener una corrección con alerta cuando todos los modelos coinciden pero van a fallar juntos, lo que permite activar protocolos preventivos.
- Gestión de redes eléctricas: verificar previsiones de demanda antes de comprometer reservas, usando el panel de pronósticos del operador y modelos independientes para decidir si se ajusta la reserva o se mantiene.
- Salud pública: obtener una segunda opinión sobre ensembles de gripe (CDC FluSight) y otros hubs epidémicos, con rangos calibrados y aviso de fallo conjunto para anticipar picos no previstos.
- Riesgo de mercados y cripto: generar un rango calibrado frente a las probabilidades del consenso y las previsiones de mesas (por ejemplo, BTC/ETH horario) antes de tomar posiciones.
- Agentes de IA: actuar como comprobación de seguridad antes de que un agente ejecute una acción basada en una previsión, con decisión de abstenerse si el panel no es fiable.
- Mercados de predicción: contrastar las probabilidades implícitas de plataformas de predicción con un panel de pronosticadores independientes y detectar cuándo el consenso de mercado es frágil.
- Evaluación de encuestas profesionales: corregir encuestas de forecasters profesionales (por ejemplo, BCE) y cuantificar la incertidumbre con intervalos de confianza explícitos.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre semanas no vistas con resultados reales y re-puntuación independiente. "Mejor que el rival más fuerte" se refiere al mejor entre el panel de referencia, una multitud calibrada y un modelo de gradient boosting, seleccionado en días de selección reservados.

| Campo | Mejora frente al rival más fuerte | Rango 95% | Casos de prueba | Versión que sirve |
|---|---|---|---|---|
| Histórico meteorológico (máximas aeroportuarias ECMWF) | +34,9% | +31,3% a +38,1% | 2.464 | v1.04 |
| Encuesta de forecasters profesionales del BCE | +24,6% | +10,0% a +41,7% | 82 | v1.04 |
| Gripe (CDC FluSight) | +18,9% | +5,4% a +34,8% | 1.855 | v1.03 |
| Cripto (BTC/ETH horario) | +13,4% | +11,4% a +15,3% | 19.202 | v1.04 |

Los intervalos son del 95% por block-bootstrap. La card advierte que el resultado del BCE se apoya en solo 7 resultados distintos. No se publican resultados de benchmarks estándar de lenguaje (MMLU, HumanEval, GSM8K) porque el modelo no es de ese tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa aproximadamente 0,7 GB, por lo que la inferencia en CPU es viable según el ejemplo de la model card (`answer(models, cfg, rows_dataframe, "crypto", "cpu")`).
- GPU recomendadas: no se especifican. Dado el tamaño del paquete, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente; no se confirma en la documentación.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta oficialmente.
- Opciones de despliegue: API HTTP pública (`https://zenodivergent.dev/api/public/v1/check`), servidor MCP (`https://zenodivergent.dev/api/public/v1/mcp`), Python con safetensors vía `huggingface_hub` y `zeno_core`, y ONNX Runtime para los campos Crypto, Weather history, ECB y Flu.
- Latencia y throughput: no disponibles. La API MCP admite lotes de 25 paneles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directos de meta-previsión en la documentación proporcionada. Los rivales citados en la propia evaluación son el panel de referencia, una multitud calibrada y un modelo de gradient boosting, pero no se ofrecen sus especificaciones ni nombres concretos.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno v1.05 unified | No disponible | No disponible | +34,9% / +24,6% / +18,9% / +13,4% frente al rival más fuerte en los cuatro campos evaluados | Apache 2.0 | Hugging Face, API HTTP, MCP |
| Modelos comparables de meta-previsión | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es una vista previa de investigación, no un producto listo para producción.
- Los intervalos de confianza son amplios en algunos campos: el del BCE va de +10,0% a +41,7% y se apoya en solo 7 resultados distintos.
- Los campos no listados en la tabla de resultados no mostraron mejora medible con las versiones nuevas y siguen servidos por v1.01.
- Los campos no entrenados se responden como "no probados"; el modelo no extrapola a dominios fuera de los 13 cubiertos.
- No es un modelo de lenguaje: no genera texto libre, no razona en lenguaje natural ni soporta tool calling genérico más allá de su API específica.
- No se documentan sesgos, riesgos de alucinación en sentido clásico ni limitaciones idiomáticas, al no ser un modelo lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero el estado de "research preview" desaconseja desplegarlo en producción sin validación propia.
- La dependencia de la API pública (`zenodivergent.dev`) introduce un punto único de fallo si se usa en modo remoto.

## Enlaces

- Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v105
- Versión v1.01: https://huggingface.co/ZenoDivergent/zeno-divergent-v101
- Sitio web: https://zenodivergent.dev
- Live Read: https://zenodivergent.dev/live-read
- Proof: https://zenodivergent.dev/proof
- Start: https://zenodivergent.dev/start
- API HTTP: https://zenodivergent.dev/api/public/v1/check
- Servidor MCP: https://zenodivergent.dev/api/public/v1/mcp
