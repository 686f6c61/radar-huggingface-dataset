# tahar-amin/Valet-LFM3-1.7B

## Resumen

Valet-LFM3-1.7B es un ajuste fino de LiquidAI/LFM3-1.7B, un modelo de lenguaje de 1.728.801.536 parametros desarrollado por tahar-amin para Valet, una aplicacion de iPhone que archiva documentacion, gestiona plazos y crea recordatorios de forma local en el dispositivo. El modelo resuelve el problema del agentico on-device: ejecutar tool calling fiable y conversaciones multilingues sin enviar datos a la nube, algo critico para una app que maneja documentos personales.

El modelo parte de la arquitectura LFM3 de Liquid AI (familia de modelos compactos orientados a eficiencia) y se distribuye en formato MLX cuantizado con precision mixta (entre 3 y 8 bits por unidad, media de 4,0 bits), pensado para ejecutarse con mlx-swift-lm en hardware Apple. El repositorio incluye ademas un adaptador LoRA de rango 16 sobre los ultimos 12 bloques, entrenado contra los pesos cuantizados exactos.

Su relevancia actual radica en que demuestra un flujo completo de adaptacion para agentes moviles: ajuste supervisado sobre trazas sinteticas del agente, cuantizacion por sensibilidad medida y rejection-sampling fine-tuning con respuestas verificadas del propio modelo, sin usar datos de usuarios. El resultado es una mejora medible en las tareas del banco de pruebas propio de Valet, con un punto debil conocido en conversaciones largas con multiples peticiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM3 de Liquid AI, segun modelo base) |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX con precision mixta, 3 a 8 bits por unidad, media 4,0 bits |
| Idiomas soportados | fr, en, de, es, it, nl, pt, ar, zh, ja, ko |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (MLX) + adaptador PEFT LoRA separado |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base LiquidAI/LFM3-1.7B, un transformer de 1.700 millones de parametros. Sobre esa base, el autor aplico tres modificaciones encadenadas: primero, ajuste fino supervisado sobre trazas sinteticas del agente Valet (llamadas a herramientas, prompt propio del producto y los 11 idiomas soportados); segundo, cuantizacion de precision mixta para MLX, donde los bits por unidad se eligen segun la sensibilidad medida de cada capa; y tercero, un LoRA de rango 16 sobre los ultimos 12 bloques, entrenado mediante rejection-sampling fine-tuning sobre las propias respuestas verificadas del modelo.

Un detalle tecnico relevante es que el adaptador LoRA se entreno contra los pesos ya cuantizados y debe cargarse sin fusionar sobre el modelo cuantizado: fusionarlo y recuantizar pierde parte de la ganancia. La app lo carga con mlx-swift-lm usando `QLoRALinear` sobre las capas cuantizadas. No se emplearon datos de usuarios en ninguna fase del entrenamiento.

## Capacidades

- Generacion de texto conversacional orientada a un agente de productividad personal (archivo de documentos, plazos, recordatorios).
- Tool calling / function calling: es la capacidad central para la que fue ajustado, con trazas sinteticas especificas del agente Valet.
- Razonamiento multi-paso dentro de una peticion, medido en el banco de pruebas del autor (suites dev, hard y quick).
- Capacidades multilingues en 11 idiomas: frances, ingles, aleman, espanol, italiano, neerlandes, portugues, arabe, chino, japones y coreano.
- Ejecucion on-device en hardware Apple mediante MLX y mlx-swift-lm, sin dependencia de servidores.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Gestion documental en el movil: el modelo clasifica y archiva documentos escaneados directamente en el iPhone, sin subir el contenido a ningun servidor, lo que es adecuado para datos personales sensibles y se apoya en su ajuste especifico sobre trazas del agente Valet.
- Seguimiento de plazos y vencimientos: extrae fechas de facturas y contratos y genera recordatorios mediante tool calls al calendario o a la app de recordatorios del sistema, aprovechando el ajuste en function calling.
- Asistente conversacional multilingue: atiende a usuarios en cualquiera de los 11 idiomas soportados dentro de una misma app, con un rendimiento medido de 90,4 sobre 100 en la suite multilingue de su banco de pruebas.
- Automatizacion de tareas administrativas personales: encadena acciones como crear un recordatorio, etiquetar un documento y fijar una fecha limite en una sola peticion, gracias al soporte de razonamiento multi-paso dentro de una solicitud.
- Prototipado de agentes on-device para iOS: sirve como referencia de pipeline completo (SFT, cuantizacion mixta y LoRA con QLoRALinear) para equipos que quieran adaptar un modelo compacto a un agente movil propio.
- Despliegue con requisitos de privacidad estrictos: al ejecutarse integramente en el dispositivo con MLX, encaja en escenarios donde la normativa o la politica interna impiden el procesamiento en la nube.

## Benchmarks y rendimiento

Resultados del banco de pruebas propio de Valet, ejecutado de forma greedy como lo hace la app. "base" es el mismo modelo sin el adaptador LoRA.

| Suite | base | con adaptador |
|---|---|---|
| dev (185 tareas) | 93,0 | 95,4 |
| dev, multilingue (60) | 85,1 | 90,4 |
| hard (125) | 95,6 | 96,5 |
| quick (38) | 85,5 | 88,9 |
| marathon (conversaciones largas multi-peticion) | ~63/100 | ~63/100 (sin cambios) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/unificada estimada: el repo ocupa 1,0 GB, coherente con una cuantizacion media de 4,0 bits sobre 1.728.801.536 parametros; el adaptador LoRA anade una cantidad marginal.
- Hardware objetivo: dispositivos Apple con memoria unificada, ya que el modelo esta empaquetado para MLX y la app lo ejecuta con mlx-swift-lm (iPhone y Macs con Apple Silicon).
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo del artefacto; no se documenta soporte para CUDA en la informacion disponible.
- Cabe en hardware de consumo Apple: si, dado el tamano del repo de 1,0 GB y la cuantizacion de 4 bits.
- Opciones de despliegue: MLX y mlx-swift-lm con `QLoRALinear`; no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valet-LFM3-1.7B | 1.728.801.536 | no disponible | Agente on-device para iOS, MLX 4 bits + LoRA | LFM Open License v1.0 | Hugging Face (repo MLX) |
| LiquidAI/LFM3-1.7B | 1.700 millones (aprox., segun nombre) | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Alternativas de ~1-2B para on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada; la unica comparacion publicada es contra el propio modelo base sin adaptador.

## Limitaciones y advertencias

- Punto debil conocido: las conversaciones largas con multiples peticiones (suite "marathon") se mantienen en torno a 63 sobre 100, sin mejora respecto al modelo base.
- El adaptador LoRA debe cargarse sin fusionar sobre los pesos cuantizados; fusionarlo y recuantizar degrada la ganancia, lo que limita su portabilidad a otros formatos.
- El ajuste esta especializado en el prompt y las herramientas del agente Valet; su rendimiento fuera de ese dominio no esta documentado.
- Licencia LFM Open License v1.0: el uso comercial solo esta licenciado por debajo de un umbral de ingresos anuales de 10 millones de dolares estadounidenses.
- Riesgo de alucinacion inherente a un modelo de 1,7B; no se documentan evaluaciones especificas de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El artefacto esta empaquetado para MLX; no se documenta soporte para CUDA ni para otros runtimes de inferencia.
- No se especifica la longitud de contexto soportada, dato relevante para planificar casos de uso con documentos largos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahar-amin/Valet-LFM3-1.7B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio del modelo
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales.
