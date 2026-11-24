# viswaacsenar/bybit-binance-perp-copytrade-bot

## Resumen

La entrada `viswaacsenar/bybit-binance-perp-copytrade-bot` de Hugging Face no es un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto ejecutable portable para Windows x64 (build `v2.8.3`, identificador `19A6F9`) empaquetado en un archivo ZIP de 4,8 MB denominado `monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`, protegido con la contraseña `2026`. La model card describe funcionalidades de trading de perpetuos y copia de operaciones entre Bybit y Binance, con módulos de enrutamiento de órdenes, filtros antimoneda y motores de bundles.

No existe información sobre arquitectura de red neuronal, parámetros, tokenizador, pesos ni proceso de entrenamiento. El repositorio emplea etiquetas propias de un binario (`windows`, `windows-11`, `x64`, `portable`) y una licencia MIT declarada, pero el contenido descrito no corresponde a un modelo entrenado. El nombre del archivo descargable remite a un supuesto mod de un videojuego, lo que resulta incoherente con el propósito declarado de la herramienta.

Por tanto, esta ficha documenta la ausencia de un modelo real y advierte de los riesgos de seguridad asociados. Cualquier evaluación técnica de capacidades de IA, benchmarks o requisitos de inferencia carece de sentido en este caso, y así se indica en cada sección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario portable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas declaradas, no capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución en ZIP con ejecutable `.exe`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura neuronal, datos de entrenamiento, número de tokens procesados ni técnicas de alineación como RLHF o DPO. La model card describe componentes propios de una aplicación de trading: un módulo de bundles multi-cartera con Lookup Tables, un motor de bundles Jito/MEV, un filtro de honeypots previo a la compra, un sandbox de paper trading y un enrutador de órdenes con latencias declaradas de menos de 40 ms. Ninguno de estos elementos constituye una innovación en modelos de lenguaje.

El artefacto distribuido es un ejecutable portable para Windows x64 que, según el propio autor, requiere ejecución como administrador y extracción con contraseña. No hay repositorio de código, pesos, configuración de entrenamiento ni documentación técnica verificable.

## Capacidades

- No se han documentado capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio.
- No se declara soporte de tool calling ni de function calling en el sentido de un modelo de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- Las capacidades multilingües indicadas en las etiquetas (`en`, `ru`, `zh`, `es`, etc.) corresponden a metadatos del repositorio, no a un modelo evaluado.
- La model card menciona funcionalidades de trading (enrutamiento de órdenes, paper trading, filtros de tokens), pero no existe verificación independiente de su funcionamiento.

## Casos de uso

- No procede. Al no existir un modelo de IA, no es posible describir casos de uso legítimos de inferencia, generación o razonamiento.
- La herramienta declarada se orienta a la automatización de operaciones con perpetuos y copia de operaciones entre exchanges, pero no se ha verificado su funcionamiento ni su seguridad.
- Cualquier uso en producción de un binario sin código fuente auditable, distribuido con contraseña y alojado en un repositorio de terceros con nombre incoherente, conlleva riesgos elevados de seguridad y de pérdida de fondos.
- No se recomienda su despliegue en entornos con claves de API de exchanges, carteras con fondos reales ni infraestructura corporativa.
- La ausencia de telemetría declarada por el autor no es verificable sin análisis del binario.
- No se identifican escenarios de integración con pipelines de IA, CI/CD o agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras de latencia y frecuencia de sondeo que aparecen en la model card (menos de 5 ms, menos de 31 ms, menos de 40 ms, 231 Hz, 134 Hz) son afirmaciones del autor sin metodología de medición ni verificación independiente, por lo que no se recogen como resultados de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no es un modelo de IA.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del binario declarado: Windows 10 u 11 de 64 bits, ejecución como administrador, extracción previa del ZIP de 4,8 MB con contraseña `2026`.
- Latencia y throughput: no verificables; las cifras del autor carecen de metodología publicada.

## Comparativa con modelos similares

No disponible. No existe un modelo de IA comparable porque el artefacto no es un modelo. Tampoco se identifican herramientas de trading auditables equivalentes en la información proporcionada.

| Criterio | Este repositorio | Alternativa de IA open source | Alternativa de trading auditable |
|---|---|---|---|
| Naturaleza | Binario portable Windows | Modelo de lenguaje | Software con código fuente |
| Parámetros | no disponible | no disponible | no aplica |
| Contexto | no disponible | no disponible | no aplica |
| Licencia | MIT declarada | no disponible | no disponible |
| Verificabilidad | Baja (sin código, con contraseña) | Media/alta | Alta |

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, arquitectura, tokenizador ni documentación de entrenamiento.
- El nombre del archivo descargable (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`) no guarda relación con la función declarada de trading, lo que constituye una señal de alerta.
- La distribución mediante un ZIP protegido con contraseña y la instrucción de ejecutar como administrador son prácticas habituales en campañas de malware.
- El aviso de la model card sobre falsos positivos de Windows Defender o SmartScreen y la recomendación de añadir exclusiones incrementan el riesgo de seguridad.
- No hay verificación independiente de las funcionalidades de trading, de la ausencia de telemetría ni de las latencias declaradas.
- El uso con claves de API de exchanges o carteras con fondos reales puede provocar pérdida de capital y comprometer credenciales.
- La licencia MIT declarada no exime de responsabilidad al usuario ni garantiza la integridad del binario distribuido.
- Cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento verificable.
- No se debe tratar este repositorio como una fuente fiable para evaluaciones técnicas, benchmarks ni despliegues en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/viswaacsenar/bybit-binance-perp-copytrade-bot
- Enlace de descarga citado en la model card (no verificado, no recomendado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Repositorio de releases citado en la model card (no verificado): https://github.com/EmmaGiordano4850/bybit-binance-perp-copytrade-bot/releases/latest
- Paper, blog, demo o documentación técnica adicional: no disponible.
