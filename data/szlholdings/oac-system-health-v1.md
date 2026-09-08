# SZLHOLDINGS/oac-system-health-v1

## Resumen

OAC System Health v1 es un modelo de regresión logística, sin dependencias, desarrollado por SZL Holdings para monitorizar la salud operativa de infraestructuras de transporte mediante telemetría sintética. No se trata de un modelo clínico ni médico; el repositorio fue renombrado desde `oac-clinical-transport-health-v1` para eliminar una nomenclatura engañosa. Está diseñado para emitir un aviso de atención del operador (`operator_attention_score`) basado en 8 campos operativos concretos.

El modelo se publica en HuggingFace bajo licencia Apache-2.0 y se distribuye como un archivo JSON (`model.json`) junto con un recibo de artefacto (`artifact_receipt.json`) que permite verificar el SHA-256 del modelo antes de la inferencia. Al ser una regresión logística con 8 entradas, no es un modelo de lenguaje: su valor reside en su simplicidad, interpretabilidad y en la verificación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística implementada con la biblioteca estándar de Python (descenso de gradiente por lotes) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo tabular con 8 campos de entrada |
| Tipos de cuantizacion | No aplica: el modelo se distribuye como `model.json`, no como pesos safetensors o GGUF |
| Idiomas soportados | No disponible (es un modelo numérico, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | JSON (`model.json`) con recibo de artefacto (`artifact_receipt.json`) |

## Arquitectura y entrenamiento

El modelo es una regresión logística estándar entrenada con descenso de gradiente por lotes, implementada únicamente con la biblioteca estándar de Python. Con una semilla fija se generan 768 ejemplos de entrenamiento, 192 de validación y 240 de prueba. Todos los datos son sintéticos y simulan telemetría de transporte operacional; no se utilizaron datos de pacientes, laboratorios ni ningún dominio clínico. No se aplicaron técnicas de RLHF ni DPO.

La innovación técnica más destacable es la verificación de integridad del modelo mediante SHA-256 a partir de `artifact_receipt.json` antes de la inferencia. La entrada acepta exactamente 8 campos operativos, y cualquier valor desconocido, ausente, no finito, fuera de rango o con semántica clínica (HL7, FHIR, paciente, espécimen, pedido, resultado) provoca que el modelo falle de forma cerrada. La salida incluye un mapa de autoridad explícito con todos los valores a falso, lo que impide inferencias sin sustento.

## Capacidades

- Emite un `operator_attention_score` continuo y un advisory booleano tras aplicar el umbral seleccionado por validación.
- Acepta exactamente 8 campos operativos: `listener_running`, `tls_enabled`, `peer_allowlist_configured`, `queue_utilization`, `consecutive_failures`, `seconds_since_last_success`, `ledger_integrity_ok` y `configuration_valid`.
- Proporciona contribuciones por característica, lo que permite interpretar qué campos influyen en el score.
- Incluye un mapa de autoridad explícito (todos los flags a falso) para evitar inferencias sin sustento.
- Puede ejecutarse sin paquetes de terceros; solo requiere Python y el script `oac_operational_health.py`.
- No soporta tool calling, uso de agentes, razonamiento multi-paso, visión, audio ni generación de lenguaje natural; es un clasificador tabular de una sola salida.

## Casos de uso

- Monitorización de un gateway de transporte: el modelo puede usarse como comprobador periódico, por ejemplo en un cron, evaluando las 8 señales operativas y emitiendo un advisory si el score supera el umbral.
- Alertas tempranas de fallos en infraestructura: `consecutive_failures` y `seconds_since_last_success` permiten detectar patrones de degradación antes de que se conviertan en incidentes.
- Observabilidad de colas de trabajo: `queue_utilization` señala cuándo la cola está cerca de saturarse, ayudando a priorizar la intervención del operador.
- Validación de configuración y TLS: combina `listener_running`, `tls_enabled`, `peer_allowlist_configured` y `configuration_valid` para indicar desajustes de seguridad.
- Verificación de integridad de datos: `ledger_integrity_ok` permite detectar fallos en la comprobación del ledger operativo sin lógica adicional.
- Entrenamiento y simulación de operadores: al generar datos sintéticos, el modelo sirve como referencia educativa para enseñar cómo se entrena e interpreta una regresión logística en un entorno operativo.
- Integración en pipelines CI/CD: el script puede invocarse desde un paso de pipeline para comprobar la salud de un servicio antes de desplegar.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de prueba sintético de 240 ejemplos:

| Metrica | Valor |
|---|---|
| Balanced accuracy | 0.7414 |
| Precision | 0.4124 |
| Recall | 0.7843 |
| F1 | 0.5405 |
| ROC AUC | 0.8302 |
| Umbral seleccionado | 0.16 |
| Falsos positivos | 57 |
| Falsos negativos | 11 |

Estos valores son resultados de línea base sobre datos sintéticos y no justifican la promoción a producción. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 MB; el modelo no requiere GPU.
- GPU recomendadas: ninguna; es suficiente una CPU con Python 3.x.
- Cabe en cualquier hardware, incluidos dispositivos embebidos o entornos con restricciones de dependencias.
- Opciones de despliegue: ejecución directa con `python -I -B oac_operational_health.py --model model.json --receipt artifact_receipt.json --input example_input.json`; puede integrarse en cron, systemd o CI/CD. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia estimada: no hay mediciones publicadas, pero la inferencia de una regresión logística con 8 características es del orden de milisegundos en una CPU moderna.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables en la documentación ni en las fuentes consultadas. Este es un modelo de nicho para telemetría operativa sintética, no un modelo de lenguaje, por lo que no existen alternativas directas en el mismo contexto.

## Limitaciones y advertencias

- No es un modelo médico ni clínico: no debe usarse con PHI, ni para diagnóstico, triage, tratamiento o decisiones clínicas.
- Todas las métricas proceden de datos sintéticos generados con semilla fija; no están calibradas para producción ni son generalizables a infraestructuras reales.
- El modelo no puede aceptar ni rechazar mensajes HL7, identificar dispositivos médicos, validar resultados ni establecer aceptación regulatoria.
- La verificación SHA-256 del recibo no es una firma criptográfica; si se reemplazan el modelo y el recibo, la protección puede eludirse.
- Los campos con semántica clínica (paciente, espécimen, pedido, resultado, HL7, FHIR) fallan de forma cerrada; la entrada debe limitarse estrictamente a los 8 campos operativos.
- El repositorio fue renombrado en 2026 para eliminar un nombre engañoso (`oac-clinical-transport-health-v1`); debe mantenerse el contexto adecuado para evitar malentendidos.
- Con un umbral de 0.16, los falsos positivos (57) superan a los falsos negativos (11); el modelo puede generar muchos avisos no justificados si se usa como alerta directa.

## Enlaces

- HuggingFace: https://huggingface.co/SZLHOLDINGS/oac-system-health-v1
- Dataset sintético: https://huggingface.co/datasets/SZLHOLDINGS/oac-clinical-transport-observability-synthetic
- GitHub de SZL Holdings: https://github.com/szl-holdings
- Repositorio source szl-forge: https://github.com/szl-holdings/szl-forge
- Integration source (clinical-gateway): https://github.com/szl-holdings/szl-forge/tree/main/clinical-gateway
