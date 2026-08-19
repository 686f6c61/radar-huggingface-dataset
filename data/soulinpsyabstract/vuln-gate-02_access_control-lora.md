# SoulInPsyAbstract/vuln-gate-02_access_control-lora

## Resumen

vuln-gate-02_access_control-lora es un adaptador LoRA especializado en la detección de vulnerabilidades de control de acceso, desarrollado por SoulInPsyAbstract como parte de la familia vuln-gate (G15) del proyecto SIPA OS (EilatSecure). El modelo se basa en Qwen2.5-7B-Instruct y está diseñado para identificar fallos como ausencia de comprobaciones de autenticación, IDOR (Insecure Direct Object References) y rutas de escalada de privilegios, reportándolos sin intentar explotarlos para confirmar su gravedad.

La particularidad de este adaptador es que se entrena exclusivamente con el comportamiento positivo de "detectar e informar", reforzando una regla de parada dura (hard stop) que impide al modelo continuar tras encontrar una vulnerabilidad. Esta aproximación busca reducir el riesgo de escalada no autorizada durante escaneos de seguridad. El adaptador es uno de seis especialistas que se fusionan posteriormente en un modelo único, vuln-gate-merged-qwen25-lora, para cubrir distintos tipos de vulnerabilidades.

Con solo 180 ejemplos de entrenamiento y 3 épocas de SFT, este adaptador es ligero (0.1 GB) y se integra fácilmente con la librería peft. Su relevancia radica en ofrecer una capa de comportamiento seguro para agentes de análisis de vulnerabilidades, complementando compuertas arquitectónicas deterministas con un refuerzo a nivel de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, parametros entrenables no especificados; modelo base 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, tipicamente 32k tokens en Qwen2.5-7B-Instruct, no confirmado) |
| Tipos de cuantizacion | 4-bit (bnb) durante entrenamiento; inferencia puede usar cuantizacion del modelo base |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-7B-Instruct, un modelo transformer autoregresivo con atención causal. La capa LoRA utiliza r=16, alpha=32 y dropout=0.05, aplicada a los módulos q, k, v, o, gate, up y down projections. El entrenamiento se realizó con cuantización de 4 bits (bitsandbytes) durante 3 épocas, usando TRL SFTTrainer/SFTConfig con un enfoque de SFT positivo: solo se entrenó con ejemplos que muestran el comportamiento deseado (detectar, informar y detenerse), nunca con texto de escalada o racionalización posterior.

El dataset consta de 180 ejemplos específicos para este grupo, de los cuales 20 se retuvieron para evaluación y nunca se usaron en entrenamiento. La innovación principal es el refuerzo explícito de una regla de parada dura (protocolo G15) mediante entrenamiento supervisado, en lugar de depender únicamente de instrucciones en el prompt. El autor aclara que esto no sustituye una compuerta arquitectónica determinista en producción, sino que complementa el patrón de compuerta binaria L06/G15 descrito en el experimento EXP-023.

## Capacidades

- Detección de vulnerabilidades de control de acceso: identifica ausencia de comprobaciones de autenticación, IDOR y rutas de escalada de privilegios en código o configuraciones.
- Generación de informes estructurados: produce reportes con qué vulnerabilidad se encontró, dónde, su gravedad y cómo corregirla.
- Cumplimiento de regla de parada dura: tras detectar una vulnerabilidad, el modelo se detiene y no continúa con acciones adicionales, incluso ante presión de contexto (urgencia, autoridad, coste hundido).
- Integración con pipelines de seguridad: puede usarse como componente en agentes de escaneo autorizado, conectado a herramientas de análisis estático o dinámico.
- Compatibilidad con el ecosistema HuggingFace: se carga mediante `PeftModel` y funciona con `transformers`, permitiendo su uso en entornos estándar de Python.

## Casos de uso

- Auditoría de control de acceso en aplicaciones web: el adaptador puede analizar rutas y endpoints para detectar falta de autenticación o autorización, generando informes accionables para el equipo de desarrollo.
- Revisión de código en CI/CD: integrado en un pipeline, el modelo escanea pull requests en busca de patrones IDOR o escalada de privilegios, señalando posibles fallos antes del despliegue.
- Análisis de APIs REST: dado un esquema de API, el modelo identifica operaciones que no verifican permisos, ayudando a priorizar correcciones.
- Entrenamiento de agentes de seguridad: sirve como ejemplo de comportamiento seguro para otros modelos, mostrando cómo detenerse tras la detección sin intentar explotar la vulnerabilidad.
- Soporte a pentesters autorizados: durante pruebas de penetración legítimas, el modelo asiste señalando posibles vectores de acceso no autorizado, pero sin ejecutar explotaciones.
- Evaluación de cumplimiento de políticas de seguridad: el modelo puede revisar configuraciones de control de acceso en sistemas existentes y reportar desviaciones respecto a políticas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el especialista fue evaluado en su conjunto de retención (20 ejemplos) antes de fusionarse con sus hermanos, pero no se proporcionan métricas numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, pero requiere el modelo base Qwen2.5-7B-Instruct para funcionar.
- VRAM estimada para inferencia: el modelo base en FP16 necesita aproximadamente 14 GB; con cuantización 4-bit, alrededor de 7 GB. El adaptador añade un overhead mínimo.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB); para 4-bit, una GPU con 8 GB (RTX 3080, RTX 4070) puede ser suficiente.
- Opciones de despliegue: se puede usar con `transformers` y `peft` directamente, o servidores de inferencia como vLLM, TGI o llama.cpp (si se convierte el adaptador a GGUF). No se han documentado configuraciones específicas.
- Latencia y throughput: no especificados; dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA equivalentes para detección de vulnerabilidades de control de acceso con los que comparar directamente. Como referencia, se puede comparar con el modelo base Qwen2.5-7B-Instruct, que sin el adaptador carece del comportamiento de parada dura entrenado y podría intentar explotar vulnerabilidades si se le solicita. Otros modelos de seguridad como Llama-3-8B-Instruct o Mistral-7B podrían usarse con adaptadores similares, pero no hay datos publicados de esta familia. La tabla siguiente resume la comparación con el modelo base:

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia |
|---|---|---|---|---|
| vuln-gate-02_access_control-lora | Adaptador sobre 7B | No disponible | SFT positivo con regla de parada | Apache-2.0 |
| Qwen2.5-7B-Instruct (base) | 7B | 32k (tipico) | Instrucciones generales | Apache-2.0 |
| Llama-3-8B-Instruct | 8B | 8k | Instrucciones generales | Llama 3 license |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo; requiere cargar el modelo base Qwen2.5-7B-Instruct.
- Entrenado con solo 180 ejemplos, lo que limita su generalización a casos no vistos; puede fallar en patrones de vulnerabilidad atípicos.
- La regla de parada dura está reforzada por entrenamiento, pero no es una garantía arquitectónica. En producción, la detección debe implementarse con código determinista, no con decisiones del LLM.
- Solo cubre la categoría de control de acceso; no detecta otros tipos de vulnerabilidades (inyección, XSS, etc.).
- No se especifican idiomas soportados; probablemente entrenado con datos en inglés, puede tener un rendimiento limitado en otros idiomas.
- Riesgo de alucinación: el modelo puede generar informes de vulnerabilidades inexistentes o con detalles incorrectos; se recomienda verificación humana.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache-2.0, sin restricciones conocidas.
- Sin benchmarks publicados, el rendimiento real en tareas de detección es incierto.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/SoulInPsyAbstract/vuln-gate-02_access_control-lora)
- [Modelo fusionado vuln-gate-merged-qwen25-lora](https://huggingface.co/SoulInPsyAbstract/vuln-gate-merged-qwen25-lora)
- [Proyecto SIPA OS](https://sipa-os.org)
