# Yehhs/LFM2-8B-A1B-GGUF

## Resumen
LFM2-8B-A1B-GGUF es la versión cuantizada en formato GGUF del modelo LFM2-8B-A1B, desarrollado por Liquid AI. Se trata de una familia de modelos híbridos de mezcla de expertos (MoE) diseñados específicamente para inteligencia artificial en el borde (edge AI) y despliegue en dispositivos locales. El modelo original tiene 8.339.930.560 parámetros totales y 1.5 mil millones de parámetros activos, lo que permite un equilibrio entre calidad y eficiencia computacional.

Este repo concreto, creado por Yehhs, aporta los pesos en GGUF para que el modelo pueda ejecutarse con llama.cpp y herramientas compatibles. El autor de Liquid AI indica que LFM2-8B-A1B es el mejor MoE on-device en calidad y velocidad, con calidad comparable a modelos densos de 3-4B y velocidad superior a Qwen3-1.7B. La longitud de contexto no se ha especificado en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Mezcla de Expertos) |
| Parámetros totales | 8.339.930.560 |
| Parámetros activos | 1.500.000.000 (1.5B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (variantes de cuantización no especificadas en la información) |
| Idiomas soportados | Inglés (en), árabe (ar), chino (zh), francés (fr), alemán (de), japonés (ja), coreano (ko), español (es) |
| Licencia | LFM 1.0 (licencia `other` según HuggingFace) |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base LiquidAI/LFM2-8B-A1B |

## Arquitectura y entrenamiento
LFM2-8B-A1B pertenece a la generación LFM2 de Liquid AI, una nueva generación de modelos híbridos. El README indica específicamente que es el primer MoE basado en LFM2, con 8.3B parámetros totales y 1.5B activos. La arquitectura combina elementos híbridos, aunque no se detallan en la información disponible los componentes exactos (si incluye atención lineal, SSM, etc.). El modelo está pensado para el despliegue en el borde y en dispositivos locales.

El entrenamiento se ha enfocado en mejorar significativamente las capacidades de código y conocimiento en comparación con LFM2-2.6B. No se han proporcionado en la información disponible datos sobre el número de tokens de entrenamiento, composición del dataset, ni metodologías de alineación como RLHF o DPO.

## Capacidades
- Generación de texto y conocimiento: pipeline de text-generation, con capacidades de código y conocimiento mejoradas frente a LFM2-2.6B.
- Generación de código: el README subraya que las capacidades de código han mejorado significativamente respecto a modelos anteriores de LFM2.
- Multilingüe: soporta ocho idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano y español.
- Eficiencia en dispositivos locales: gracias a su diseño MoE con solo 1.5B parámetros activos, ofrece una ejecución rápida y con bajo consumo de memoria, apta para móviles, tablets y portátiles de gama alta.
- Despliegue flexible: al estar disponible en GGUF, puede ejecutarse con llama.cpp y otros lanzadores compatibles como Ollama.
- No se han documentado capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso
- Asistente personal en dispositivos móviles: el modelo, cuantizado en GGUF, puede ejecutarse localmente en teléfonos y tablets de gama alta, ofreciendo respuestas en ocho idiomas sin depender de la nube. El uso de solo 1.5B parámetros activos reduce la latencia y el consumo energético.
- Generación de código en entornos sin conexión: las capacidades de código mejoradas frente a LFM2-2.6B permiten utilizarlo en entornos de desarrollo offline o como asistente de programación en portátiles, especialmente en proyectos que requieren privacidad de código.
- Traducción entre idiomas soportados: dado su soporte de ocho idiomas, puede implementarse en aplicaciones de traducción local o sistemas de transcripción en tiempo real.
- Chatbot multilingüe para atención al cliente: aunque no documenta tool calling, el modelo puede gestionar conversaciones de texto en varios idiomas, lo que lo hace útil para chatbots básicos de soporte en dispositivos o servidores ligeros.
- Clasificación o análisis de texto en entornos edge: la eficiencia del MoE permite procesar grandes volúmenes de texto en servidores pequeños o computación en el borde, como clasificación de documentos o análisis de sentimiento.
- Aplicaciones educativas y de estudio: su capacidad de conocimiento general, unida al bajo coste de inferencia, permite crear herramientas de tutoría o resolución de dudas en dispositivos personales.
- Prototipado de modelos híbridos MoE en local: al ser un repositorio GGUF con una versión más reciente (LFM2.5) disponible, puede ser útil para investigadores que necesiten evaluar este tipo de arquitectura sin infraestructura cloud.

## Benchmarks y rendimiento
No se han publicado resultados numéricos de benchmarks en la información disponible. El README incluye afirmaciones cualitativas: el modelo ofrece una calidad comparable a modelos densos de 3-4B y una velocidad superior a Qwen3-1.7B, y sus capacidades de código y conocimiento son significativamente mejores que las de LFM2-2.6B. Sin embargo, no se facilitan métricas concretas (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware
- VRAM estimada: no disponible. El tamaño del repositorio GGUF es de 48.1 GB, lo que sugiere que incluye múltiples variantes de cuantización, pero no se especifica la VRAM por archivo.
- GPU recomendadas: no disponible.
- Las variantes cuantizadas del modelo están diseñadas para ejecutarse en dispositivos de gama alta: teléfonos, tablets y portátiles, según el README.
- Opciones de despliegue: llama.cpp (uso directo con `llama-cli -hf LiquidAI/LFM2-8B-A1B-GGUF`), Ollama y otras herramientas compatibles con el formato GGUF. El modelo también está etiquetado como `endpoints_compatible` en HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No hay información suficiente en los datos disponibles para una comparativa cuantitativa con otros modelos. El README afirma que LFM2-8B-A1B es más rápido que Qwen3-1.7B y comparable en calidad a los modelos densos de 3-4B, pero no se aportan métricas. También se indica que supone una mejora significativa en código y conocimiento frente a LFM2-2.6B. La nueva versión LFM2.5-8B-A1B-GGUF ya está disponible, según la model card.

| Modelo | Afirmación del README |
|---|---|
| LFM2-8B-A1B | Mejor MoE on-device en calidad y velocidad |
| Qwen3-1.7B | Más rápido que el modelo |
| Modelos densos 3-4B | Calidad comparable |
| LFM2-2.6B | Mejor en código y conocimiento |

## Limitaciones y advertencias
- Sesgos: no se documentan sesgos específicos en la información disponible. Como cualquier modelo de lenguaje, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Alucinación: riesgo de alucinación inherente a los modelos generativos; no se proporcionan medidas específicas de mitigación en la información.
- Limitaciones de contexto o idioma: la longitud de contexto no está especificada. El soporte multilingüe se limita a los ocho idiomas indicados; la calidad por idioma no se ha evaluado en la información disponible.
- Restricciones de licencia: licencia LFM 1.0 (`license: other`). Se recomienda revisar el texto completo de la licencia antes de usar el modelo en entornos comerciales, ya que no se detallan los permisos en la model card.
- Caveat por cuantización: al tratarse de una versión cuantizada en GGUF, puede haber una ligera pérdida de exactitud respecto al modelo en precisión completa. La degradación depende de la variante de cuantización elegida.
- Actualización: existe una versión más reciente: LFM2.5-8B-A1B-GGUF. Se debe valorar si interesa usar la versión nueva en lugar de esta.

## Enlaces
- Repositorio GGUF: https://huggingface.co/Yehhs/LFM2-8B-A1B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2-8B-A1B
- Nueva versión: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B-GGUF
- Blog de Liquid AI: https://www.liquid.ai/blog/
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
