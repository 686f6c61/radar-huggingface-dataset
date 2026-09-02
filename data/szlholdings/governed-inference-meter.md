# SZLHOLDINGS/governed-inference-meter

## Resumen

`governed-inference-meter` es un kernel universal de Hugging Face desarrollado por SZL Holdings que envuelve cualquier llamada de inferencia y emite un recibo JSON encadenado por hash SHA-256, con medición de energía GPU vía NVIDIA NVML y una puerta de política configurable. Su propósito es aportar gobernanza y trazabilidad energética a la inferencia en entornos soberanos, regulados o sensibles al coste y al carbono, calculando tokens por julio y permitiendo auditoría independiente de secuencias de llamadas.

El proyecto está **deprecado** y ha sido consolidado en el paquete `szl_energy_attest.inference_meter` del repositorio canónico `szl-energy-attest`. Este repositorio y su artefacto en Hugging Face se mantienen como "tumba" para que las referencias existentes no devuelvan 404, pero no deben usarse para nuevas integraciones. No se trata de un modelo de lenguaje ni de un modelo de aprendizaje automático, sino de una utilidad de software de medición y gobernanza.

La relevancia actual radica en que aborda un hueco en el ecosistema de kernels de Hugging Face: no existía un kernel de medición de energía más gobernanza. Su doctrina de honestidad es estricta: solo reporta julios reales cuando NVML está presente y concede lectura de energía; en caso contrario, etiqueta el recibo como `mode="unmeasured"` y deja los campos de julios y tokens por julio como `null`, sin fabricar cifras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Utilidad Python (kernel universal de Hugging Face) |
| Parametros totales | No aplica (no es un modelo neuronal) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (codigo fuente Python) |

## Arquitectura y entrenamiento

No es un modelo entrenado; es una libreria Python ligera y sin dependencias pesadas. Su diseño se basa en tres modulos principales: `_energy.py` (medicion de energia via NVML), `_policy.py` (puerta de politica allow/deny) y `_receipt.py` (generacion de recibos JSON con hash encadenado). El flujo integra la lectura de potencia de la placa (potencia total de la GPU, incluyendo memoria y perdidas) durante el tiempo de ejecucion, calcula tokens por julio, aplica una politica consultiva (por defecto permite) y emite un recibo con digest SHA-256 del cuerpo canonico del registro. No hay entrenamiento ni datos de entrenamiento; la unica "innovacion" es la combinacion de metering energetico, gobernanza y trazabilidad en una sola llamada envuelta.

## Capacidades

- Medicion de energia GPU en julios mediante NVML (potencia de placa integrada sobre tiempo de pared).
- Calculo de tokens por julio.
- Puerta de politica consultiva (allow/deny) que registra la decision en el recibo; el wrapper `meter()` falla de forma segura si la llamada es denegada.
- Emision de recibos JSON con encadenamiento SHA-256 para auditoria independiente de secuencias de llamadas.
- Degradacion honesta: si no hay lectura de energia, el recibo se etiqueta como `mode="unmeasured"` y los campos de energia son `null`.
- Integracion como kernel universal de Hugging Face, ademas de utilidad Python independiente.
- Compatibilidad con entornos de inferencia que usen NVIDIA (requiere NVML).

## Casos de uso

- Auditoria energetica de inferencia en produccion: envolver llamadas a modelos LLM para registrar julios consumidos y tokens por julio, generando un rastro auditable para informes de sostenibilidad o cumplimiento normativo.
- Gobernanza en entornos soberanos o regulados: aplicar politicas de allow/deny antes de ejecutar inferencias, dejando constancia de la decision en el recibo para revision posterior.
- Control de costes en despliegues cloud: medir el consumo energetico real por peticion para optimizar la seleccion de hardware o el dimensionamiento de instancias.
- Trazabilidad en pipelines de IA generativa: encadenar recibos de multiples llamadas para reconstruir el historial completo de una tarea compleja (por ejemplo, generacion de informes con varios pasos).
- Investigacion en eficiencia de modelos: comparar el coste energetico de diferentes modelos o configuraciones de cuantizacion en un mismo hardware.
- Cumplimiento de politicas internas de IA responsable: registrar que cada inferencia paso por una revision de politica y que se midio su impacto energetico, sin depender de afirmaciones no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no incluye metricas de rendimiento comparativas con otras herramientas similares.

## Requisitos de hardware

- Requiere una GPU NVIDIA con soporte NVML y permisos de lectura de energia (power/energy readback). Sin esto, la medicion no esta disponible y el recibo se marca como `unmeasured`.
- No se especifican requisitos minimos de VRAM ni de modelo de GPU; depende del entorno de inferencia que se envuelva.
- Es una utilidad ligera en Python, por lo que el overhead adicional es minimo.
- Opciones de despliegue: como kernel de Hugging Face o como libreria Python independiente. No se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia, aunque puede envolver cualquier llamada.
- Latencia y throughput: no disponibles; dependen del hardware y del modelo envuelto.

## Comparativa con modelos similares

No se dispone de informacion sobre herramientas directamente comparables en el ecosistema de kernels de Hugging Face. El propio proyecto afirma que no existia un kernel de medicion de energia + gobernanza antes de su creacion. La alternativa actual es el sucesor `szl-energy-attest`, que consolida la funcionalidad en el paquete `szl_energy_attest.inference_meter`. No hay datos de rendimiento ni de caracteristicas de otras soluciones para comparar.

## Limitaciones y advertencias

- **Deprecado**: el repositorio esta marcado como deprecado y superado por `szl-energy-attest`. No debe usarse para nuevas integraciones; solo se mantiene para referencia y rollback.
- **Medicion solo con NVML**: la energia solo es real cuando NVML esta presente y concede lectura. Sin ello, el recibo se etiqueta como `unmeasured` y los julios son `null`. Nunca se fabrican cifras.
- **Politica consultiva**: la puerta de politica es solo consultiva y no puede imponer nada por si misma; el host debe saltarse la llamada denegada. El wrapper `meter()` falla de forma segura, pero la aplicacion final es responsabilidad del usuario.
- **Digest no es firma**: el digest SHA-256 es una huella de integridad, no una firma criptografica. No prueba autoria.
- **Potencia de placa**: NVML reporta potencia de toda la placa (nucleo, memoria, perdidas), no solo del compute die. Se reporta lo que el hardware da, sin modelado ni factores de escala.
- **Licencia**: Apache-2.0 permite uso comercial, pero al estar deprecado, se recomienda usar el sucesor.
- **Sin soporte**: no se mantiene ni se publican ejecuciones de prueba que respalden la tarjeta del modelo.

## Enlaces

- [Hugging Face: SZLHOLDINGS/governed-inference-meter](https://huggingface.co/SZLHOLDINGS/governed-inference-meter)
- [GitHub: szl-holdings/governed-inference-meter](https://github.com/szl-holdings/governed-inference-meter)
- [Repositorio sucesor: szl-energy-attest](https://github.com/szl-holdings/szl-energy-attest)
- [Commit de migracion verificado](https://github.com/szl-holdings/szl-energy-attest/commit/4d8d105c3d5ea67b5eb25826e8a2a35ca35f4043)
- [Sitio de SZL Holdings](https://holdings.a-11-oy.com/)
