# woofwoof61/zils-lite-t2

## Resumen
zils-lite-t2 es un ajuste fino mediante LoRA (rango 64, fusionado) sobre un modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario woofwoof61. Forma parte de lo que el autor denomina el "lite pool" de la subred 127 de Zils, un ecosistema de modelos de decisión (decision-model) orientados a tareas de clasificación y elección entre opciones. El modelo parte de un "soup" (promedio uniforme de pesos) de dos variantes previas, `joamCriff123/zils-lite-l1125a` y `joamCriff123/zils-lite-l1123q`, sobre el que se aplica el ajuste supervisado.

El problema que aborda es la producción de decisiones etiquetadas de forma consistente dentro de un pipeline de modelos de decisión, combinando datos supervisados reales, objetivos suaves (soft targets) generados por un modelo de decisión mayor y datos de replay que preservan el comportamiento del punto de partida. Con 852.985.920 parámetros y un repositorio de 1,7 GB en safetensors, es un modelo compacto pensado para inferencia ligera.

Es relevante ahora por su carácter de modelo pequeño y de licencia Apache-2.0, lo que facilita su despliegue en entornos con recursos limitados, aunque su naturaleza experimental (0 descargas, 0 likes, creado y actualizado en el mismo minuto) indica que se trata de una publicación temprana y sin validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-0.8B); ajuste LoRA rango 64 fusionado |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de transformers, aunque no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only heredado de Qwen/Qwen3.5-0.8B, sobre el que se aplica un ajuste fino LoRA de rango 64 que posteriormente se fusiona en los pesos base. El punto de partida es un "soup" de pesos calculado como promedio uniforme de dos variantes anteriores del mismo pool (`zils-lite-l1125a` y `zils-lite-l1123q`), lo que sitúa al modelo dentro de una cadena de iteraciones sucesivas sobre la misma familia.

El entrenamiento combina tres fuentes de datos: decisiones etiquetadas escritas a partir de los splits oficiales de entrenamiento de conjuntos de datos públicos, objetivos suaves (soft targets) generados por un modelo de decisión de mayor tamaño sobre las mismas preguntas, y decisiones de replay que incorporan las respuestas del soup de partida. El autor declara explícitamente que no se usaron filas de test de benchmarks. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades
- Generación de decisiones etiquetadas dentro de un pipeline de modelos de decisión (decision-model), que es el propósito declarado del ajuste.
- Capacidades heredadas del modelo base Qwen/Qwen3.5-0.8B en generación de texto, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).
- Modo thinking, visión o audio: no disponible.

## Casos de uso
- Clasificación y enrutamiento de decisiones: el modelo puede utilizarse como clasificador de decisiones dentro de un pipeline mayor, eligiendo entre opciones predefinidas a partir de una entrada textual, aprovechando su entrenamiento específico con etiquetas supervisadas y soft targets.
- Destilación de un modelo de decisión mayor: dado que se entrenó con soft targets de un modelo de mayor tamaño, puede emplearse como aproximación ligera de ese modelo en entornos con restricciones de cómputo.
- Evaluación de pipelines de decisión en investigación: sirve como componente de referencia para estudiar el comportamiento de la familia zils-lite y comparar iteraciones del pool.
- Prototipado rápido en local: con 852 millones de parámetros y 1,7 GB de pesos, puede cargarse en una GPU de consumo para experimentar con decisiones sin infraestructura dedicada.
- Integración en sistemas de moderación o filtrado por categorías: siempre que se adapte el formato de decisión al dominio concreto, el modelo puede emitir etiquetas de clasificación sobre textos de entrada.
- Base para nuevos ajustes LoRA: al ser un punto intermedio de una cadena de soups, puede servir como inicialización para futuras iteraciones del pool o para ajustes específicos de dominio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16, aproximadamente 1,7 GB de pesos más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 en contexto corto; tarjetas de consumo como RTX 3060, RTX 4060 o superiores son suficientes. Para mayor throughput, A100 o H100, aunque el tamaño del modelo no las requiere.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más en FP16 y en tarjetas con 4 GB en cuantización.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad de arquitectura con Qwen, potencialmente vLLM, llama.cpp u Ollama mediante conversión a GGUF, aunque no está documentado por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-t2 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la informacion | Hugging Face |
| joamCriff123/zils-lite-l1125a | no disponible | no disponible | no disponible | Hugging Face |
| joamCriff123/zils-lite-l1123q | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Modelo experimental sin validación externa: 0 descargas y 0 likes en el momento de la ficha, publicado y actualizado en el mismo minuto, lo que sugiere ausencia de revisión por la comunidad.
- Riesgo de alucinación: al ser un ajuste sobre un modelo base pequeño, puede generar decisiones o texto incorrectos con alta confianza; no se documentan evaluaciones de fiabilidad.
- Sesgos conocidos: no documentados; los datos de entrenamiento provienen de conjuntos públicos y de soft targets de un modelo mayor, cuyos sesgos pueden heredarse.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están informados, lo que impide garantizar su comportamiento fuera del inglés o en entradas largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor remite a LICENSE y NOTICE para las atribuciones de componentes upstream, que deben revisarse antes de producción.
- Dependencia de la cadena de soups: el modelo es un punto intermedio de una familia en evolución, por lo que su comportamiento puede quedar obsoleto frente a iteraciones posteriores del pool.
- Caveat para producción: la ausencia de documentación sobre tool calling, agentes y formato de salida limita su integración directa en sistemas que requieran interfaces estructuradas.

## Enlaces
- [Hugging Face: woofwoof61/zils-lite-t2](https://huggingface.co/woofwoof61/zils-lite-t2)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [joamCriff123/zils-lite-l1125a](https://huggingface.co/joamCriff123/zils-lite-l1125a)
- [joamCriff123/zils-lite-l1123q](https://huggingface.co/joamCriff123/zils-lite-l1123q)
