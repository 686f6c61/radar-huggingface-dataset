# Thox-ai/ThoxUSB-Edge

## Resumen

ThoxUSB-Edge es un ajuste fino (SFT) del modelo Qwen/Qwen3.5-0.8B publicado por THOX.ai dentro de su programa de dispositivos de borde. El modelo se distribuye en dos formatos: pesos completos en safetensors (752.393.024 parámetros según los tensores reales del repositorio) y una cuantización GGUF Q4_K_M de 529 MB, pensada para ejecutarse en hosts con al menos 1 GB de RAM. La model card declara 873M de parámetros, cifra que no coincide con el recuento real de safetensors; conviene tomar el dato del tensor como referencia técnica.

El objetivo declarado es servir como asistente en dispositivo y enrutador de herramientas para la familia de hardware THOX, con un enfoque local-first y sin dependencia de servicios en la nube. El ajuste se realizó sobre corpus de chat y de uso de agentes y herramientas del propio programa THOX, partiendo de la arquitectura Qwen3.5 del modelo base.

La relevancia del modelo es doble. Por un lado, ejemplifica la tendencia de modelos sub-1000M optimizados para inferencia local en hardware muy limitado. Por otro, el propio autor lo marca explícitamente como EXPERIMENTAL: no publica registro de entrenamiento, benchmarks medidos ni validación en dispositivo, y la model card incluye una campaña de Kickstarter para el hardware asociado. Cualquier evaluación en producción debe partir de esa advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (safetensors); la model card declara 873M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (BF16/FP16 segun repo), GGUF Q4_K_M |
| Idiomas soportados | en (ingles); calidad inferior en otros idiomas segun el autor |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (1.504.827.608 B) y GGUF Q4_K_M (529.288.992 B); incluye Modelfile de Ollama |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 orientado a texto (tag `qwen3_5_text`). Sobre esa base se aplica un ajuste supervisado (SFT) con corpus de chat y de agentes/uso de herramientas descritos por el autor como propios del programa THOX. No se detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; la model card afirma que no se reclama ningún entrenamiento más allá de lo descrito.

No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, híbridos SSM, etc.). El repositorio incluye `chat_template.jinja`, `config.json`, `tokenizer.json`, `tokenizer_config.json`, `generation_config.json` y un `Modelfile` para Ollama. La model card advierte que la ejecución requiere una build de llama.cpp u Ollama con soporte para esta arquitectura.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Enrutamiento de herramientas y soporte de agentes: el ajuste se realizó sobre corpus de agent/tool-use, por lo que el modelo está pensado para emitir llamadas a herramientas dentro de un flujo de agente.
- Uso como asistente en dispositivo (on-device) en hardware de borde con recursos muy limitados.
- Capacidad multilingüe limitada: el autor indica que el entrenamiento es mayoritariamente en inglés y que la calidad en otros idiomas es inferior.
- No se documentan capacidades de visión, audio, modo thinking explícito ni matemáticas avanzadas.

## Casos de uso

- Asistente local en dispositivo USB: el modelo cabe en 529 MB en Q4_K_M y puede ejecutarse con Ollama (`ollama run hf.co/Thox-ai/ThoxUSB-Edge:Q4_K_M`) en hosts con al menos 1 GB de RAM, lo que permite un asistente privado sin conexión.
- Enrutamiento de herramientas en agentes ligeros: al estar ajustado sobre corpus de tool-use, puede usarse como primer nivel de un pipeline de agente que decide qué herramienta invocar antes de delegar en un modelo mayor.
- Automatización de chat de soporte de baja complejidad: para respuestas acotadas y en inglés, con verificación humana obligatoria dado el estado experimental.
- Prototipado rápido en entornos con hardware restringido: sirve para validar flujos de conversación y plantillas de chat antes de migrar a un modelo mayor.
- Despliegue en dispositivos empotrados con llama.cpp: la build GGUF permite integrarlo en aplicaciones C/C++ sin dependencias de Python.
- Filtrado o clasificación conversacional previa: por su tamaño, puede actuar como primera etapa para descartar consultas triviales y escalar el resto a un modelo de mayor capacidad.
- Experimentación académica con modelos sub-1000M: útil como referencia de ajuste fino sobre Qwen3.5-0.8B con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultado THOX GATE49 ni benchmark publicado para este modelo.

## Requisitos de hardware

- VRAM/RAM estimada: al menos 1 GB de RAM para la build Q4_K_M (529 MB de pesos más overhead de contexto y runtime).
- Pesos en safetensors: 1.504.827.608 B (aproximadamente 1,5 GB), lo que requiere alrededor de 2 GB de memoria para inferencia en precisión nativa.
- GPU recomendadas: no disponible; el modelo está orientado a CPU y hardware de borde. Cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) por tamaño, aunque no se documenta rendimiento.
- Cabe en GPU consumer: sí, por tamaño; no hay datos medidos de latencia ni throughput.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (con `Modelfile` incluido) y cualquier runtime compatible con GGUF. Requiere build con soporte para la arquitectura Qwen3.5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| ThoxUSB-Edge | 752M (safetensors) | no disponible | Apache-2.0 | safetensors, GGUF Q4_K_M | Experimental, sin benchmarks |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | Apache-2.0 (segun base) | safetensors | Modelo base upstream |
| Alternativas sub-1B de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks del modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Build no validada: el autor declara que el comportamiento en dispositivo no se ha medido y recomienda verificar las salidas antes de confiar en ellas.
- Sin benchmarks ni registro de entrenamiento publicados: no es posible comparar su calidad de forma objetiva.
- Riesgo de alucinación elevado por tamaño: los modelos pequeños cometen errores factuales y pueden producir salidas seguras pero incorrectas.
- Sesgos derivados del corpus de entrenamiento, mayoritariamente en inglés; calidad inferior en otros idiomas.
- La cuantización Q4_K_M intercambia precisión por tamaño, con la consiguiente pérdida de exactitud.
- Uso fuera de alcance declarado: decisiones críticas de seguridad, médicas o legales sin humano en el bucle, y control no supervisado de dispositivos físicos sin paso de confirmación.
- Discrepancia entre los parámetros declarados (873M) y los reales en safetensors (752M): conviene verificar el `config.json` antes de dimensionar el despliegue.
- La model card incluye una campaña de Kickstarter del fabricante; el modelo debe evaluarse por sus méritos técnicos, no por el material promocional.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxUSB-Edge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo de dispositivos THOX: https://thox.ai/#demo-callout-home_lineup
- Campaña Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Repositorio llama.cpp (runtime requerido): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
