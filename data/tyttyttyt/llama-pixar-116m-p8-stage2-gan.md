# TYTTYTTYT/llama-pixar-116m-p8-stage2-gan

## Resumen

MIXAR 113M (8x8 patches) es un modelo de lenguaje experimental que abandona el tokenizador textual: opera directamente sobre píxeles binarios de una sola canal, organizados en parches de 8x8 con dos parches por bloque. Lo desarrolla el usuario TYTTYTTYT dentro del ecosistema del proyecto MIXAR (april-tools), y esta ficha concreta corresponde a la ablación de segunda etapa entrenada con objetivos adversarios (GAN) durante 5.000 pasos sobre el backbone de primera etapa `llama-pixar-116m-p8`.

El modelo resuelve un problema de investigación: comprobar si el refinamiento adversarial, receta heredada de modelos basados en píxeles anteriores, aporta señal útil sobre las generaciones libres del propio modelo. La respuesta documentada por el autor es negativa: mejora el realismo local de los glifos pero no proporciona señal de entrenamiento sobre la salida autoregresiva libre, y degrada la precisión en bAbI respecto al backbone de primera etapa. El autor lo publica explícitamente como ablación de comparación y **no** como modelo recomendado.

Arquitectura transformer tipo Llama con 113,46 millones de parámetros reales (12 capas, dimensión oculta 768, 12 cabezas, MLP de 3072), contexto de hasta 1.024 bloques aunque entrenado sobre ventanas de 180 bloques, y licencia Apache 2.0. Su relevancia es metodológica: sirve como punto de control negativo frente a la variante GRPO de la misma etapa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (12 capas, hidden 768, 12 cabezas, MLP 3072) sobre píxeles |
| Parámetros totales | 113.462.016 (113M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 1.024 bloques; entrenado en ventanas de 180 bloques |
| Tipos de cuantización | No disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,5 GB), con código custom (`trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la configuración clásica de Llama pequeña, pero con una interfaz de entrada y salida totalmente distinta: en lugar de tokens de un vocabulario, recibe y emite píxeles binarios de un canal, agrupados en parches de 8x8 y en bloques de dos parches. El objetivo de preentrenamiento es entropía cruzada binaria por píxel sobre el siguiente bloque, lo que equivale a un modelado autoregresivo en el espacio de la imagen renderizada del texto. El contexto se mide en bloques, no en tokens.

El preentrenamiento usó mC4 en ocho idiomas con muestreo uniforme del corpus agrupado (es 0,243; de 0,207; fr 0,171; ja 0,127; en 0,126; it 0,088; zh 0,024; ko 0,015), 1M de pasos con batch global 384, AdamW (0,9, 0,95), weight decay 0,1, LR 3e-4 con decaimiento coseno hasta 3e-5 y 2k pasos de warmup, durante unas 29 horas en 4 GPU H200. Los documentos se empaquetan en secuencias de 180 bloques con separadores EOS y máscaras de atención por documento. Sobre ese backbone, esta variante aplica 5.000 pasos de entrenamiento adversario (GAN) como receta de segunda etapa; el proyecto MIXAR sustituye esa etapa por GRPO en su variante principal. El repositorio incluye `render_config/` con las fuentes y ajustes de renderizado exactos del preentrenamiento, que deben usarse tal cual para evitar un cambio de distribución.

## Capacidades

- Generación de texto en espacio de píxeles: produce la representación renderizada del texto siguiente bloque a bloque, sin tokenizador intermedio.
- Modelado multilingüe en ocho idiomas (de, en, es, fr, it, ja, ko, zh), con calidad desigual según la proporción de cada idioma en el corpus.
- Clasificación de secuencias mediante `LlamaPixarForSequenceClassification`, incluida en el módulo de código custom del repo para fine-tuning.
- Detección implícita de fin de secuencia mediante bloque en blanco (umbral configurable, 0,1 en el ejemplo del autor).
- Caché KV con `past_key_values` para generación incremental por bloques.
- No dispone de tool calling, function calling, modo thinking, visión natural, audio ni capacidades de agente multi-paso.

## Casos de uso

- Investigación en modelos libres de tokenizador: sirve como punto de comparación controlado para medir el efecto del refinamiento adversarial frente a GRPO en la misma etapa y el mismo backbone.
- Reproducción de ablaciones: con los 5.000 pasos documentados y el backbone público, permite replicar el experimento y verificar la conclusión de que el objetivo GAN no aporta señal sobre generaciones libres.
- Estudio de renderizado y tipografía: al incluir `render_config/` con fuentes exactas, es útil para analizar cómo el dominio visual (fuente, tamaño, alineación) condiciona la distribución aprendida.
- Fine-tuning de clasificación de texto renderizado: la clase `LlamaPixarForSequenceClassification` permite adaptar el modelo a tareas de clasificación sobre imágenes de texto en los ocho idiomas del corpus.
- Docencia y divulgación: ejemplo compacto (113M, 0,5 GB) de modelado autoregresivo en espacio de píxeles que cabe en una GPU consumer para demostraciones.
- Evaluación de protocolos de generación libre: útil para contrastar métricas de precisión en bAbI y LAMBADA bajo el protocolo del proyecto MIXAR y detectar cómo distintas etapas de alineamiento alteran esas cifras.
- Base para experimentos de decodificación visual: la lógica de bloque en blanco como EOS y el alineado del prompt al borde de escritura son piezas reutilizables en prototipos de generación de imagen de texto.

## Benchmarks y rendimiento

Precisión en generación libre, mismo protocolo que el resto de modelos MIXAR:

| Modelo | bAbI tarea 1 (en) | LAMBADA (media de 5 idiomas) |
|---|---|---|
| Etapa 1 (punto de partida) | 11,4 | 6,0 |
| Este modelo (etapa 2 adversarial) | 7,8 | 6,1 |
| Etapa 2 con GRPO | 15,6 | 10,4 |

LAMBADA por idioma para este modelo: en 4,6 / de 11,2 / es 4,6 / fr 4,8 / it 5,4.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 113M de parámetros ocupan aproximadamente 0,45 GB de pesos; el consumo real depende del tamaño del contexto en bloques y de la caché KV, pero en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: el preentrenamiento se hizo en 4 H200, pero para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer con soporte CUDA y suficiente memoria para el renderizado y el contexto.
- Opciones de despliegue: `transformers==4.57.3` con `trust_remote_code=True` y el paquete `pixar-render==0.5.1`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que la interfaz no es de tokens.
- Latencia y throughput: no disponibles. La generación es bloque a bloque con caché KV y una pasada por bloque, lo que implica un coste por paso mayor que la decodificación por token en modelos equivalentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | bAbI t1 (en) | LAMBADA (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (etapa 2 GAN) | 113M | 1.024 bloques (entrenado en 180) | 7,8 | 6,1 | Apache 2.0 | HuggingFace |
| llama-pixar-116m-p8 (etapa 1) | 113M | 1.024 bloques (entrenado en 180) | 11,4 | 6,0 | Apache 2.0 | HuggingFace |
| llama-pixar-116m-p8-stage2 (GRPO) | 113M | 1.024 bloques (entrenado en 180) | 15,6 | 10,4 | Apache 2.0 | HuggingFace |
| mgpt2-124m-mc4 (baseline con tokenizador) | 124M | No disponible | No disponible | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- El propio autor lo declara una ablación de comparación y **no** un modelo recomendado; no debería usarse como modelo de referencia en producción.
- El entrenamiento adversario no aporta señal sobre las generaciones libres del modelo y reduce la precisión en bAbI (7,8 frente a 11,4 de la etapa 1), por debajo del punto de partida.
- Calidad multilingüe muy desigual: LAMBADA en alemán (11,2) contrasta con valores de 4,6–5,4 en el resto, coherente con el desequilibrio del corpus (de 0,207 frente a ko 0,015).
- Cambiar la fuente o los ajustes de `render_config/` supone un cambio de distribución y degrada la salida; el modelo solo es fiable con el renderizado exacto del preentrenamiento.
- La interfaz no es de tokens: no es compatible con ecosistemas estándar de inferencia (vLLM, llama.cpp, TGI) ni con tool calling o agentes.
- Riesgo elevado de alucinación y de salidas incoherentes por el tamaño reducido (113M) y por la naturaleza experimental del objetivo en espacio de píxeles.
- El contexto entrenado es de 180 bloques aunque se anuncie soporte de hasta 1.024; usar ventanas mucho mayores puede degradar la calidad.
- Licencia Apache 2.0 permite uso comercial, pero el código de modelado se carga con `trust_remote_code=True`, lo que implica ejecutar código del repositorio y requiere revisión previa en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2-gan
- Backbone de etapa 1: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8
- Contrapartida con GRPO: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p8-stage2
- Variante 116M con parches 32x32: https://huggingface.co/TYTTYTTYT/llama-pixar-116m-p32
- Variante 477M con parches 32x32: https://huggingface.co/TYTTYTTYT/llama-pixar-477m-p32
- Baseline con tokenizador: https://huggingface.co/TYTTYTTYT/mgpt2-124m-mc4
- Código del proyecto MIXAR: https://github.com/april-tools/mixar
- Paper: https://arxiv.org/abs/2604.11575
