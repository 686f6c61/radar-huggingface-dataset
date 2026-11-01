# v2xvi/medtwin-hunter

## Resumen

MedTwin-Hunter es un framework de gemelo digital (digital twin) orientado a la predicción de dano fisiológico en pacientes conectados a dispositivos médicos del Internet of Medical Things (IoMT) y sistemas ciberfísicos médicos (MCPS). Lo desarrolla el usuario v2xvi y se distribuye como repositorio en HuggingFace con licencia MIT, acompanado de una aplicación Gradio y un repositorio GitHub (rizzshi/medtwin-hunter). No es un modelo de lenguaje ni una red neuronal con pesos publicados: es una herramienta de simulación y detección que combina modelos fisiológicos y modelos de firmware de dispositivos para anticipar el dano al paciente ante ciberataques.

El problema que aborda es la discrepancia semántica de los sistemas de detección de intrusiones convencionales: un IDS de red puede validar la sintaxis de un paquete, pero no si una orden (por ejemplo, subir el PEEP de un ventilador o la tasa de infusión de un vasopresor) es clínicamente apropiada para el estado fisiológico actual del paciente. MedTwin-Hunter propone un enfoque predictivo: en lugar de alertar cuando se cruza un umbral (detección reactiva), proyecta una ventana temporal de descompensación y avisa con antelación.

La relevancia actual radica en la proliferación de dispositivos médicos conectados en UCI y quirófanos, donde un ataque no compromete solo la confidencialidad, sino que se traduce directamente en dano físico. El repositorio de HuggingFace tiene 0 GB de tamano, 0 descargas y 0 likes, y no expone pesos ni pipeline; la model card describe escenarios de simulación con ventanas de pre-aviso de 24 a 27 segundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemelo digital basado en simulación de eventos discretos (SimPy) con ecuaciones diferenciales ordinarias (ODE) de fisiología cardiopulmonar y modelos de firmware de dispositivos IoMT |
| Parámetros totales | no disponible (no es un modelo neuronal con pesos publicados) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamano de 0.0 GB) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card se organiza en torno a un simulador de eventos discretos SimPy que modela conjuntamente la fisiología del paciente mediante ODE (oxigenación, ventilación y presión arterial media) y una flota de dispositivos IoMT (ventilador mecánico, bomba de infusión y monitor de cabecera). El simulador genera un flujo de telemetría compuesto por `PatientState` y `DeviceState`, y el framework compara la evolución del gemelo con la telemetría observada para detectar discrepancias y proyectar una "cono de pronóstico" temporal de descompensación.

No se proporcionan datos sobre entrenamiento, número de tokens, composición del dataset, ni sobre técnicas de RLHF o DPO, porque el artefacto no es un modelo generativo entrenado con esos paradigmas. La innovación técnica destacable es el enfoque de detección semántica basada en fisiología: el sistema evalúa si una orden es clínicamente coherente con el estado del paciente, en lugar de limitarse a firmas de red o umbrales fijos, y emite una predicción con ventana de intervención anticipada (por ejemplo, 24 segundos en el escenario de manipulación de PEEP y 27 segundos en el de sobredosis de vasopresor).

## Capacidades

- Simulación de fisiología cardiopulmonar: modela oxigenación, ventilación y presión arterial media mediante ODE.
- Modelado de dispositivos IoMT: ventilador mecánico, bomba de infusión de vasopresores y monitor multiparámetro de cabecera.
- Detección de manipulación de setpoints: identifica cambios no autorizados como el PEEP de 5 a 18 cmH2O o la tasa de infusión de 0,1 a 1,2 µg/kg/min.
- Detección de inyección de datos falsos (FDI): identifica discrepancias entre la telemetría reportada (por ejemplo, SpO2 = 72 %) y la saturación arterial real del gemelo (97 %).
- Pronóstico pre-emptivo con ventana temporal: proyecta el instante de descompensación y emite alerta antes de que se cruce el umbral clínico.
- Comparación reactiva frente a predictiva: el dashboard permite contrastar la detección por umbral con el pronóstico del gemelo.
- Ejecución de escenarios de validación benignos: línea base de ventilación sincronizada durante ventanas de 300 segundos.
- Interfaz interactiva Gradio para reproducir escenarios y visualizar resultados.
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento, por no ser un modelo de lenguaje.

## Casos de uso

- Evaluación de seguridad de ventiladores mecánicos: simular la manipulación del PEEP y del volumen tidal para medir el tiempo de detección y la ventana de intervención antes de un barotrauma, sin exponer a pacientes reales.
- Análisis de riesgo en bombas de infusión: reproducir escaladas encubiertas de vasopresores y cuantificar cuántos segundos de antelación ofrece el gemelo frente a una alarma por umbral de presión arterial media.
- Detección de inyección de datos falsos en monitores de cabecera: contrastar la SpO2 reportada con la saturación arterial simulada para identificar telemetría spoofeada y evitar intervenciones clínicas inapropiadas.
- Formación de personal clínico y de seguridad: usar el dashboard Gradio para que equipos de UCI y de ciberseguridad practiquen la interpretación de alertas predictivas en escenarios controlados.
- Investigación en detección de intrusiones semánticas: emplear el framework como banco de pruebas para comparar IDS de red tradicionales con detectores basados en fisiología.
- Validación de algoritmos de control en lazo cerrado: probar la robustez de rutinas de titulación automática frente a telemetría adversaria antes de desplegarlas en dispositivos reales.
- Análisis de impacto regulatorio y de riesgo: documentar con simulaciones reproducibles el impacto de vectores de ataque concretos para evaluaciones de conformidad de dispositivos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye resultados de escenarios simulados, no benchmarks estandarizados:

| Escenario | Detección reactiva | Pronóstico MedTwin-Hunter | Ventana de pre-aviso |
|---|---|---|---|
| Manipulación de PEEP en ventilador (5 a 18 cmH2O) | Umbral superado a t = 84 s | Riesgo marcado a t = 60 s, inicio previsto a t = 84 s | 24 s |
| Sobredosis de vasopresor en bomba de infusión (0,1 a 1,2 µg/kg/min) | Alarma de MAP a t = 87 s | Pico hemodinámico previsto a t = 60 s | 27 s |
| Inyección de SpO2 falsa (72 % reportado frente a 97 % real) | Falsa alarma clínica | Discrepancia identificada a t = 60 s | no cuantificada |
| Línea base benigna (PEEP 5 cmH2O, Vt 480 mL, 300 s) | Sin evento | Sin evento | no aplica |

## Requisitos de hardware

- No se especifican requisitos de GPU: el framework se ejecuta sobre SimPy y Python 3.10+, por lo que el cómputo es de CPU.
- El repositorio de HuggingFace ocupa 0.0 GB y no contiene pesos, de modo que no requiere VRAM para inferencia de un modelo neuronal.
- Despliegue previsto como aplicación Gradio (sdk_version 6.30.0, app_file app.py), ejecutable en CPU y potencialmente en HuggingFace Spaces.
- No se documentan latencia ni throughput; los escenarios descritos operan en ventanas de 60 a 300 segundos de tiempo simulado.
- No se indican opciones de servido tipo vLLM, llama.cpp, Ollama o TGI, al no existir pesos de modelo.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque de detección | Licencia | Disponibilidad |
|---|---|---|---|---|
| MedTwin-Hunter | Gemelo digital fisiológico + firmware IoMT | Predictivo, basado en coherencia clínica | MIT | Repositorio HuggingFace y GitHub |
| IDS de red convencional | Detección de intrusiones por firmas y anomalías de paquetes | Reactivo, sintáctico | Variable | Amplia |
| Sistemas de monitorización con umbrales clínicos | Alarmas de UCI | Reactivo, por umbral | Propietario habitualmente | Comercial |
| Simuladores fisiológicos genéricos | Modelos ODE de paciente | Simulación sin detección de ataques | Variable | Académica |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo: no debe evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- La fidelidad del pronóstico depende de la calidad del modelo ODE de fisiología y de los modelos de firmware; no se documenta su validación clínica.
- Los resultados presentados corresponden a escenarios simulados, no a datos de pacientes reales, por lo que no hay evidencia de eficacia clínica publicada.
- El repositorio tiene 0 descargas y 0 likes, sin pipeline declarado ni pesos; el estado de madurez del proyecto es incipiente.
- No se documentan sesgos, cobertura poblacional del modelo fisiológico ni limitaciones por subgrupos de pacientes (edad, comorbilidades, etc.).
- La licencia MIT permite uso comercial, pero no se ofrece ninguna garantía ni certificación regulatoria para uso clínico.
- No se especifican idiomas soportados ni localización de la interfaz.
- Cualquier uso en producción sanitaria requeriría validación independiente, análisis de riesgo y cumplimiento normativo de dispositivos médicos.

## Enlaces

- HuggingFace: https://huggingface.co/v2xvi/medtwin-hunter
- HuggingFace Space: https://huggingface.co/spaces/v2xvi/medtwin-hunter
- GitHub: https://github.com/rizzshi/medtwin-hunter
- Kaggle Notebook: https://www.kaggle.com/code/tfisthis/medtwin-hunter-twin-mechanics
