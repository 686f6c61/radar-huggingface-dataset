# swordenamine/dz-app-revenue-ledger

## Resumen

`swordenamine/dz-app-revenue-ledger` no es un modelo de inteligencia artificial: es una herramienta de linea de comandos escrita en Python, publicada en HuggingFace bajo un repositorio con el tag `region:us`, que implementa un libro de ingresos (ledger) autoalojado para ingresos de suscripciones moviles. Recoge eventos de venta y reembolso, aplica las comisiones de las tiendas (fee), convierte los importes a una divisa de reporte —DZD por defecto— usando tipos de cambio que el usuario introduce manualmente, y genera informes mensuales. Ademas, incluye un subcomando `advise` que imprime una lista de verificacion sobre opciones de cobro de las tiendas.

El repositorio no contiene pesos, tokenizador, configuracion de transformer ni ningun artefacto de inferencia. El pipeline no esta declarado, la licencia no aparece en los metadatos ni en la model card, y no se especifican idiomas soportados. En el momento de la consulta registra 0 descargas y 0 likes, y la unica documentacion disponible es el README (que remite a `docs/ARCHITECTURE.md`, no incluido en la informacion proporcionada).

Su relevancia es, por tanto, la de una utilidad de contabilidad operativa para desarrolladores de apps moviles que quieren consolidar ingresos de tiendas sin depender de servicios externos, no la de un componente de IA. Cualquier evaluacion como modelo de lenguaje, vision o audio carece de sentido con los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como modelo de IA; el repositorio contiene una aplicacion CLI en Python |
| Parametros totales | no disponible (no hay pesos ni recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo generativo) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible (la model card esta redactada en ingles; la CLI no declara internacionalizacion) |
| Licencia | no disponible (no declarada en los metadatos ni en el README) |
| Formato de pesos | no disponible; el repositorio distribuye codigo fuente Python, no safetensors ni GGUF |
| Version de Python requerida | 3.10 o superior |
| Dependencias de terceros | ninguna (segun la model card) |
| Divisa de reporte por defecto | DZD (configurable en `.env`) |
| Entrada de datos | eventos JSON via `POST /events` con cabecera `X-Signature` = HMAC-SHA256 en hexadecimal; importacion de CSV con fichero de mapeo JSON |
| Esquema de evento | `event_id`, `store`, `product_id`, `occurred_on` (YYYY-MM-DD), `amount`, `currency`, `kind` (`sale` o `refund`), `fee` (opcional) |
| Interfaz | CLI (`add-rate`, `import-csv`, `report`, `advise`, `serve`) y servidor HTTP integrado |
| Fecha de creacion | 2026-10-17 |

## Arquitectura y entrenamiento

No existe entrenamiento. El repositorio describe una herramienta autoalojada sin dependencias de terceros, con una base de datos local cuya ruta se configura en `.env` (el motor concreto no se especifica) y un servidor HTTP que expone un endpoint `POST /events` protegido mediante firma HMAC-SHA256 hexadecimal. La configuracion cubre ruta de base de datos, secreto de webhook, host y puerto, divisa de reporte y tasa de comision por defecto.

El flujo funcional documentado tiene cuatro piezas: registro manual de tipos de cambio por fecha y divisa (`add-rate 2026-09-01 USD 135`), importacion de informes CSV de tienda con un mapeo de columnas declarativo (`--mapping samples/play_mapping.json --store play`), generacion de informes mensuales (`report 2026-09`) y una lista de verificacion sobre opciones de payout (`advise`). El propio autor declara fuera de alcance los adaptadores de webhook especificos por tienda, las fuentes oficiales de tipos de cambio y cualquier conclusion legal, y remite a `docs/ARCHITECTURE.md` para el detalle de diseno, documento no disponible en la informacion proporcionada.

## Capacidades

- Registro de eventos de venta y reembolso con identificador, tienda, producto, fecha, importe, divisa y comision opcional.
- Aplicacion de comisiones de tienda, con tasa por defecto configurable y posibilidad de indicar la comision por evento.
- Conversion de importes a divisa de reporte usando tipos de cambio introducidos por el usuario, indexados por fecha y divisa.
- Importacion masiva desde CSV de tiendas mediante fichero de mapeo JSON y parametro `--store`.
- Generacion de informes mensuales por periodo (`report YYYY-MM`).
- Ingesta de eventos en tiempo real mediante servidor HTTP propio con validacion de firma HMAC-SHA256.
- Subcomando `advise` con una lista de comprobaciones previas a la eleccion del metodo de cobro de las tiendas.
- Script de puesta en marcha idempotente (`scripts/setup.sh`: entorno virtual, instalacion, `.env` y base de datos).
- Suite de pruebas ejecutable con `python -m unittest discover -s tests -v`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidad de agentes.

## Casos de uso

- Conciliacion mensual de ingresos de suscripciones: el equipo importa el CSV de ventas de Google Play con `import-csv ... --store play` y obtiene el informe del mes con `report`, consolidando ventas y reembolsos en una sola cifra neta de comisiones.
- Normalizacion a una divisa unica: una app que factura en USD, EUR y DZD registra el tipo de cambio real de su banco con `add-rate` para cada fecha relevante y obtiene informes comparables entre meses sin depender de feeds externos.
- Modelado de comisiones por tienda: al poder fijar una tasa por defecto en `.env` y sobrescribirla por evento, resulta util para estimar el ingreso neto antes de que la tienda emita su liquidacion oficial.
- Ingesta automatizada desde backend propio: el servicio de compras de la app reenvia cada transaccion a `POST /events` firmada con HMAC-SHA256, de modo que el ledger se alimenta en el momento de la compra sin intervencion manual.
- Auditoria y archivo historico: al ser autoalojado y sin dependencias, el ledger se puede desplegar en infraestructura propia y conservar el detalle de eventos con `event_id` para trazabilidad interna.
- Verificacion previa a la apertura de cobros: `revenue-ledger advise` sirve como lista de comprobacion operativa (datos fiscales, cuenta bancaria, umbrales de pago) antes de configurar el payout en la consola de la tienda.
- Entornos con restricciones de red o compliance: al no requerir dependencias de terceros ni llamadas salientes, encaja en despliegues aislados donde no se permite enviar datos de facturacion a servicios SaaS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El objeto publicado no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes, por lo que no procede tabla comparativa de rendimiento.

## Requisitos de hardware

- VRAM: no aplica; la herramienta se ejecuta en CPU.
- GPU: innecesaria. No se declara soporte de aceleracion por hardware.
- Memoria y CPU: no disponibles; el README no publica requisitos de RAM ni de CPU, solo Python 3.10 o superior.
- Almacenamiento: depende del volumen de eventos y del motor de base de datos elegido para la ruta configurada en `.env` (motor no especificado).
- Despliegue: ejecucion directa en un entorno virtual creado por `scripts/setup.sh`; el propio binario `revenue-ledger serve` actua como servidor HTTP. No se documenta soporte para contenedores, vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponibles. Al no haber dependencias de terceros, la latencia vendra dominada por el acceso a la base de datos y el parseo de CSV, sin cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables en la informacion, y la comparacion con modelos de lenguaje no es aplicable porque el artefacto no es un modelo de IA. Tampoco se documentan en el README herramientas alternativas de contabilidad de ingresos de tiendas con las que establecer una comparacion con datos verificables.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, de capacidades generativas y de cualquier metrica de aprendizaje. Cualquier uso esperado como LLM es inviable.
- Licencia no declarada: sin terminos explicitos no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de integrarlo en produccion.
- Aviso explicito del autor: la herramienta no constituye asesoramiento legal ni fiscal, incluida la lista de verificacion de `advise`.
- Fuera de alcance declarado: adaptadores de webhook por tienda, fuentes oficiales de tipos de cambio y conclusiones legales. La carga de tipos de cambio es manual y depende de que el usuario introduzca datos correctos.
- Riesgo de error en la conversion: un tipo de cambio ausente o mal introducido para una fecha produce informes incorrectos sin validacion contra mercados oficiales.
- Cobertura funcional limitada: sin reconciliacion automatica contra liquidaciones de las tiendas, sin gestion de impuestos, sin devengos ni asientos de doble entrada documentados.
- Idioma y localizacion: la documentacion esta en ingles y no se declara soporte multiidioma; el formato de fecha exigido es `YYYY-MM-DD`.
- Madurez: 0 descargas y 0 likes, sin versionado ni publicacion en un indice de paquetes, lo que implica ausencia de comunidad, de historial de incidencias y de garantias de mantenimiento.
- Seguridad: el endpoint `POST /events` depende por completo de la correcta gestion del secreto HMAC; el README no detalla rotacion de secretos, limites de tasa ni TLS.
- Documentacion incompleta en la informacion disponible: `docs/ARCHITECTURE.md` se cita pero no se incluye, y no se especifica el motor de base de datos ni el esquema de almacenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/dz-app-revenue-ledger
- Documentacion de arquitectura citada por el autor: `docs/ARCHITECTURE.md` (ruta dentro del repositorio, contenido no disponible en la informacion proporcionada)
- Ejemplos citados en el README: `samples/sample_report.csv`, `samples/play_mapping.json`, `.env.example` (rutas internas del repositorio)
- No se han encontrado en la informacion proporcionada papers, blogs, demos ni repositorios adicionales.
