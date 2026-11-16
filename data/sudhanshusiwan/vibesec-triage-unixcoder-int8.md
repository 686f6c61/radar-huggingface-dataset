# sudhanshusiwan/vibesec-triage-unixcoder-int8

## Resumen

VibeSec Triage INT8 es un clasificador de secuencias ONNX cuantizado a INT8, derivado de UniXcoder y ajustado por el autor sudhanshusiwan (CyberEiche) para la plataforma de seguridad VibeSec. Su funcion no es detectar vulnerabilidades, sino reducir el ruido de las herramientas SAST: recibe el contexto de un hallazgo (regla CWE mas fragmento de codigo) y estima la probabilidad de que sea explotable, de modo que los falsos positivos benignos, saneados o no explotables puedan suprimirse antes de llegar al desarrollador.

El modelo es deliberadamente compacto: un transformer encoder clasico, no generativo, con un footprint de 22,08 MB en ONNX INT8 y una latencia declarada de 15-20 ms por hallazgo en CPU pura. Esta orientacion lo hace apto para entornos air-gapped y para ejecutarse en el propio pipeline de CI sin GPU ni llamadas de red, algo relevante en organizaciones europeas con requisitos de soberania de datos (RGPD, EU AI Act, BSI IT-Grundschutz, NIS2).

La relevancia actual del modelo no esta en su capacidad bruta, sino en su nicho: la fatiga de alertas en SAST es un problema operativo costoso, y una etapa de triaje calibrada (ECE de 0,0071) con precision declarada del 100% y recall del 98,97% sobre familias CWE concretas (89, 78, 79, 22, 798) permite priorizar sin sacrificar la retencion de vulnerabilidades criticas. Es un componente de infraestructura de seguridad, no un asistente de codigo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de UniXcoder), clasificador de secuencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamica (ONNX), calibrada |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vibesec_triage_int8.onnx`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo UniXcoder (familia de modelos de representacion de codigo derivada de los trabajos de Microsoft sobre CodeBERT/GraphCodeBERT), reutilizado como clasificador binario de secuencias. La entrada combina el identificador de regla (por ejemplo, `CWE-89 SQLi`) con el fragmento de codigo relevante, y la salida es una distribucion sobre dos clases (explotable / no explotable) de la que se deriva `P(Exploitable)`.

El ajuste fino se realizo sobre un dataset de contra factuales AST (`sudhanshusiwan/vulnerability-triage-counterfactuals`), disenado para que el modelo aprenda la diferencia entre un patron vulnerable y su version saneada (consultas parametrizadas frente a concatenacion, `os.path.basename` frente a lectura arbitraria, escape de entidades HTML frente a echo sin sanear, etc.). La evaluacion declarada usa 50 clusters de escenarios disjuntos con leakage cero entre train y eval. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO (no aplicable en un clasificador). La cuantizacion es INT8 dinamica sobre ONNX Runtime, con invariancia de score declarada entre tamanos de batch de 1 a 64.

## Capacidades

- Clasificacion binaria de hallazgos SAST: estima `P(Exploitable)` para un par (regla CWE, contexto de codigo).
- Reduccion de falsos positivos en familias CWE-89 (SQLi), CWE-78 (command injection), CWE-79 (XSS), CWE-22 (path traversal) y CWE-798 (credenciales hardcodeadas).
- Distincion entre codigo vulnerable y codigo saneado mediante patrones contra factuales (parametrizacion, escaping, sandboxing, tokens de test).
- Salidas de probabilidad calibradas (ECE 0,0071), aptas para umbralizacion y priorizacion.
- Politica de seguridad asimetrica: los patrones de severidad critica (CVSS >= 9.0) y RCE no se suprimen automaticamente.
- Inferencia 100% local en CPU, sin llamadas de red ni telemetria, apta para air-gap.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es un clasificador, no un modelo generativo.
- Idioma: solo ingles (codigo y contexto de reglas en ingles).

## Casos de uso

- Triaje de alertas SAST en CI/CD: insertar el modelo como etapa previa al reporting para descartar hallazgos con `P(Exploitable)` baja antes de abrir tickets, reduciendo el volumen de alertas que llega a los equipos de desarrollo.
- Priorizacion en paneles de vulnerabilidades: ordenar los hallazgos por probabilidad calibrada y severidad CVSS, de modo que los equipos de AppSec atiendan primero lo explotable y no lo ruidoso.
- Entornos air-gapped y regulados: desplegar el clasificador en redes sin salida a Internet (banca, sector publico, defensa) donde no es posible enviar codigo a APIs externas, cumpliendo RGPD articulos 25/32.
- Cumplimiento EU AI Act para sistemas de alto riesgo: usar las probabilidades calibradas y los registros de supresion como evidencia auditable en el marco de los articulos 9-15, con intervencion humana en el bucle.
- Verificacion de cadena de suministro: validar la integridad del modelo con las firmas Ed25519 y los digests SHA-256 declarados antes de cargarlo en produccion, segun BSI IT-Grundschutz y NIS2.
- Filtrado en pipelines de revision de codigo (pre-commit, PR checks): ejecutar el modelo en CPU junto al linter o al analizador estatico para anotar solo los hallazgos con probabilidad alta, manteniendo la latencia del pipeline por debajo de decenas de milisegundos por hallazgo.
- Investigacion en triaje de vulnerabilidades: usar el dataset de contra factuales y el modelo como base para experimentos de reduccion de falsos positivos y calibracion en clasificacion de codigo.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card, sobre 50 clusters de escenarios disjuntos:

| Metrica | Valor | Descripcion |
|---|---|---|
| Validation accuracy | 99,17% | Correccion global de clasificacion |
| Precision | 100,0% | Cero falsas alarmas introducidas |
| Critical / High recall | 98,97% | Retencion de vulnerabilidades reales |
| Expected Calibration Error (ECE) | 0,0071 | Fiabilidad de las probabilidades |
| Footprint cuantizado | 22,08 MB | ONNX INT8 dinamico |
| Latencia de inferencia | 15-20 ms | Por hallazgo en CPU estandar |
| Invariancia de score por batch | ΔP = 0,0000 | Batches B en [1, 64] |

No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU. El footprint de pesos es de 22,08 MB, por lo que el consumo de memoria en inferencia es del orden de decenas de MB.
- GPU: no necesaria. Puede ejecutarse en cualquier CPU moderna; no se especifican modelos de GPU recomendados.
- Consumer GPU: irrelevante para el caso de uso; el modelo cabe en cualquier equipo, incluidos portatiles y contenedores pequenos.
- Despliegue: ONNX Runtime (CPU), con `tokenizer.json` local. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador ONNX.
- Latencia y throughput: 15-20 ms por hallazgo en CPU estandar segun el autor; el throughput escala con el numero de nucleos y el batching (hasta B=64 sin deriva de score declarada).

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros clasificadores de triaje SAST ni con modelos de representacion de codigo de tamano comparable, por lo que no se pueden presentar cifras contrastadas.

## Limitaciones y advertencias

- Cobertura limitada a cinco familias CWE (89, 78, 79, 22, 798); hallazgos fuera de ese conjunto no estan validados y no deberian suprimirse con este modelo.
- Solo ingles: el contexto de reglas y el codigo deben estar en ingles; el rendimiento en otros idiomas no esta documentado.
- Riesgo de falsos negativos: la supresion automatica de hallazgos con probabilidad baja puede ocultar vulnerabilidades reales si el contexto de entrada difiere del distribuido en entrenamiento; la politica asimetrica mitiga solo criticos y RCE.
- Las metricas (precision 100%, recall 98,97%) proceden de la evaluacion del autor sobre su propio dataset de contra factuales; no hay validacion independiente publicada.
- El modelo no detecta vulnerabilidades por si mismo: depende de que la herramienta SAST previa aporte el contexto de regla y codigo correcto.
- Uso comercial permitido bajo Apache 2.0, pero las afirmaciones de cumplimiento (EU AI Act, RGPD, BSI, NIS2) son declaraciones del autor y no certificaciones verificadas de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion por terceros.
- No es un modelo generativo: no debe emplearse para explicar vulnerabilidades, generar parches ni tareas de razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/sudhanshusiwan/vibesec-triage-unixcoder-int8
- Dataset de entrenamiento: https://huggingface.co/datasets/sudhanshusiwan/vulnerability-triage-counterfactuals
- Repositorio del proyecto: https://github.com/cybereiche/vibesec
- Laboratorio de entrenamiento: https://github.com/cybereiche/vibesec-model-training-lab
- Paquete CLI en PyPI: https://pypi.org/project/cybereiche-vibesec/
- Sitio del autor: https://cybereiche.de
