# v2xvi/proj-2

## Resumen

BioVault es un framework de deteccion de amenazas para el Internet de las Cosas Medicas (IoMT) que combina aprendizaje federado con descenso de gradiente estocastico con privacidad diferencial (DP-SGD). Lo publica el usuario v2xvi en Hugging Face como un Space de Gradio (app_file `app.py`, SDK 6.30.0) bajo licencia MIT. No es un modelo generativo de lenguaje ni un transformer: es una aplicacion de entrenamiento e inferencia para clasificacion de trafico de red medico.

El problema que aborda es la tension entre eficacia en la deteccion de intrusiones y cumplimiento de HIPAA: los hospitales no pueden centralizar logs clinicos ni PHI entre instituciones. BioVault entrena localmente en cada silo hospitalario y solo transmite deltas de pesos perturbados con ruido gaussiano, con garantia formal (epsilon = 3.0, delta = 1e-5) y agregacion federada mediante Flower.

Resulta relevante por el aumento de campañas de ransomware y denegacion de servicio contra infraestructura clinica (bombas de infusion, ventiladores, monitores y PACS), un sector donde compartir telemetria entre hospitales esta legalmente restringido. El repositorio, sin embargo, no publica pesos (0.0 GB), no declara idiomas ni pipeline, y no incluye resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje federado (Flower, FedAvg con agregacion segura) con DP-SGD local (Opacus); clasificador de flujos de red, no transformer |
| Parametros totales | no disponible (el repositorio no publica pesos; 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica a un clasificador de flujos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (no se distribuyen pesos en el repositorio) |
| Framework de orquestacion | Flower (`flwr`) 1.9+ |
| Libreria de privacidad | Opacus (`opacus`) 1.4+ |
| Taxonomia de salida | 5 clases: BENIGN (0), DDOS (1), RANSOMWARE (2), DATA_TAMPERING (3), OTHER (4) |
| Presupuesto de privacidad | epsilon = 3.0, delta = 1e-5 (composicion RDP entre rondas) |
| Recorte de gradiente | norma L2 por muestra C = 1.0 |
| Tamano de lote local | 256 |
| Entorno de ejecucion | Python 3.10+, Gradio 6.30.0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos niveles. En el nivel local, cada nodo hospitalario entrena un clasificador sobre su propia telemetria IoMT (flujos de red de dispositivos medicos) con DP-SGD instrumentado mediante Opacus: se recorta el gradiente de cada muestra a una norma L2 maxima de C = 1.0 y se inyecta ruido gaussiano calibrado N(0, sigma^2 C^2 I) antes del paso de descenso, con lotes de 256. En el nivel central, un coordinador Flower ejecuta FedAvg o agregacion segura y redistribuye los parametros globales en rondas de comunicacion predefinidas. En ningun punto se transmiten registros crudos, flujos de dispositivo ni gradientes sin perturbar.

El objetivo declarado es epsilon = 3.0 y delta = 1e-5, con composicion bajo Rényi Differential Privacy a lo largo de las rondas federadas; el autor justifica delta << 1/N para satisfacer los requisitos estadisticos de des-identificacion de HIPAA. La salida del modelo es una clasificacion en cinco categorias (BENIGN, DDOS, RANSOMWARE, DATA_TAMPERING, OTHER), donde la ultima agrupa vectores zero-day y sondas de protocolo anomalas. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, el numero de rondas federadas, la arquitectura exacta de la red clasificadora ni si hubo ajuste fino con RLHF o DPO (no aplicable en un clasificador).

## Capacidades

- Clasificacion de trafico IoMT en cinco categorias: benigno, DDoS volumetrico, ransomware, manipulacion de datos (vitales o parametros de dosificacion) y otras anomalias o zero-day.
- Entrenamiento federado multi-institucion sin centralizar datos clinicos: solo se intercambian deltas de pesos agregados.
- Garantia formal de privacidad diferencial a nivel de muestra mediante Opacus, con recorte L2 y ruido gaussiano calibrado.
- Agregacion segura de actualizaciones en el coordinador Flower (FedAvg), lo que evita que el servidor vea contribuciones individuales en claro.
- Empaquetado como aplicacion Gradio para демonstracion o validacion del flujo federado.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso en agentes.
- No se declaran capacidades multilingues ni idiomas soportados.
- Modo "thinking", cuantizacion y decodificacion especulativa: no disponibles (no aplican a este tipo de modelo).

## Casos de uso

- Consorcio hospitalario multi-silo: varios hospitales entrenan un detector comun de ransomware sin compartir logs de red ni PHI, cumpliendo las reglas de seguridad y privacidad de HIPAA; cada centro mantiene sus datos en su perimetro y solo aporta deltas perturbados.
- Deteccion de cifrado masivo en almacenamiento clinico: el clasificador etiqueta flujos como RANSOMWARE cuando detecta rutinas de cifrado rapido contra servidores de historiales o firmware de dispositivos.
- Monitorizacion de bombas de infusion y ventiladores en red: la clase DATA_TAMPERING permite alertar sobre alteraciones de parametros de dosificacion o de las lecturas de telemetria del dispositivo.
- Proteccion de redes PACS de imagen medica: deteccion de floods volumetricos (DDOS) que saturen gateways de adquisicion de imagenes y servidores de telemetria, con modelos entrenados por cada departamento de radiologia.
- Autoridad sanitaria regional o MSP para clinicas pequenas: un coordinador central agrega actualizaciones de decenas de centros de menor tamano que por si solos no tendrian suficientes datos etiquetados para entrenar un detector competitivo.
- Fabricante de dispositivos medicos: entrena un detector de anomalias de protocolo con la telemetria de sus clientes hospitalarios sin recibir trafico identificable de pacientes, usando la clase OTHER para capturar sondas desconocidas.
- Evaluacion y auditoria de privacidad: el pipeline DP-SGD con epsilon y delta explicitos sirve como banco de pruebas para medir la perdida de utilidad del detector frente al presupuesto de privacidad antes de un despliegue regulado.
- Investigacion en FL: base reproducible (Flower + Opacus + Gradio) para experimentar con composicion RDP, numero de rondas y ruido en un dominio con requisitos regulatorios estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye exactitud, precision, recall, F1, AUC ni comparaciones con detectores de referencia, y el repositorio no contiene pesos evaluables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y no publica checkpoints, por lo que no puede estimarse el tamano del clasificador.
- GPU recomendadas: no disponibles; el autor no documenta requisitos de hardware.
- Compatibilidad con GPU de consumo: no confirmada. DP-SGD a nivel de muestra requiere calcular gradientes por muestra (Opacus los vectoriza por defecto), lo que incrementa la memoria frente a entrenamiento estandar, pero no hay cifras publicadas.
- Opciones de despliegue: Space de Gradio en Hugging Face (SDK 6.30.0), coordinador Flower autoalojado y clientes Flower con Opacus en cada nodo hospitalario, sobre Python 3.10+.
- Latencia y throughput: no disponibles. No se documentan rondas por hora, tamano del modelo ni coste de agregacion.

## Comparativa con modelos similares

| Enfoque | Naturaleza | Privacidad formal | Pesos publicados | Licencia |
|---|---|---|---|---|
| BioVault (`v2xvi/proj-2`) | FL + DP-SGD para deteccion IoMT, 5 clases | epsilon = 3.0, delta = 1e-5 declarados | no | MIT |
| IDS centralizado sobre dataset publico (CNN/LSTM sobre trafico IoT) | Clasificador entrenado en un unico repositorio de datos | sin garantia diferencial | no disponible | no disponible |
| Plataforma comercial de deteccion de amenazas IoMT | Producto propietario con correlacion en red | no disponible | no | propietaria |
| Stack generico Flower + Opacus | Infraestructura de FL con DP, sin taxonomia de dominio | configurable por el usuario | no aplica | no verificada en la informacion disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion es unicamente cualitativa.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni artefactos de modelo (0.0 GB): no es posible reproducir la inferencia ni verificar el comportamiento descrito.
- Cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso o validacion por terceros.
- Ausencia total de metricas: no se puede afirmar que el detector sea eficaz, ni comparar su perdida de utilidad frente al ruido DP.
- epsilon = 3.0 es un presupuesto de privacidad moderado, no un anonimato absoluto; sigue existiendo riesgo residual de inferencia de pertenencia y debe documentarse en un analisis de impacto.
- El ruido DP-SGD degrada la exactitud de forma no cuantificada en la informacion disponible; en clases minoritarias (RANSOMWARE, DATA_TAMPERING) el efecto puede ser severo.
- La taxonomia agrupa en OTHER cualquier vector desconocido: los zero-day quedan sin trazabilidad por tipo, lo que complica la respuesta a incidentes.
- La etiqueta "HIPAA aligned" es una declaracion del autor, no una certificacion: HIPAA no certifica productos y el cumplimiento depende de la implementacion y del acuerdo entre las partes.
- El aprendizaje federado es vulnerable a envenenamiento de modelo por clientes maliciosos y a inferencia a partir de actualizaciones si la agregacion segura no esta correctamente desplegada.
- Un Space de Gradio es un entorno de demostracion, no una plataforma de produccion clinica; no se documentan controles de autenticacion, auditoria ni trazabilidad.
- No se declaran idiomas soportados ni pipeline de Hugging Face, lo que limita la integracion automatica con herramientas del ecosistema.
- La licencia MIT permite uso comercial, pero cualquier despliegue clinico requeriria validacion regulatoria adicional (MDR en la UE, FDA en EE. UU.) que no se menciona.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo (contenido sobre Home Assistant); no se han podido verificar fuentes externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/v2xvi/proj-2
- Flower (orquestacion federada): https://flower.ai/
- Opacus (DP-SGD): https://opacus.ai/
- Python 3.10+: https://www.python.org/downloads/
- HIPAA (HHS): https://www.hhs.gov/hipaa/index.html
