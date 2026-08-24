# zorikovm/robust-activation-steering

## Resumen

El repositorio `zorikovm/robust-activation-steering` no contiene un modelo de lenguaje completo, sino un conjunto de tres módulos de denoising de activaciones diseñados para mitigar la degradación del texto cuando se aplica *activation steering* sobre GPT-2 small. El autor, zorikovm, plantea un experimento de interpretabilidad mecánica: al inyectar vectores de dirección en el *residual stream* para controlar el comportamiento del modelo, se produce una pérdida de calidad en las activaciones. Este módulo, denominado `DeepSwiGLUDenoiser`, se entrena para restaurar las activaciones originales a partir de las versiones corrompidas por el ruido introducido por el steering.

La relevancia actual radica en que el *activation steering* se ha convertido en una técnica popular para el control de modelos sin entrenamiento, y su robustez frente a perturbaciones es un área activa de investigación. Este trabajo aporta un análisis empírico sobre si un deno puede mejorar la calidad de las activaciones restauradas, aunque los resultados muestran que la simple suma del vector con un factor `alpha=0.4` supera a los denoizers entrenados en la práctica. El modelo está disponible bajo licencia MIT y se basa en GPT-2 small (openai-community/gpt2), con activaciones tomadas antes del sexto bloque.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSwiGLUDenoiser (red neuronal para denoising de activaciones) |
| Parametros totales | 2.106.112 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (no genera texto; procesa vectores de activación de 768 dimensiones) |
| Tipos de cuantizacion | No disponible (pesos en precisión flotante de PyTorch) |
| Idiomas soportados | No aplicable (trabaja sobre representaciones internas, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` en archivos `.pt` (3 archivos: `denoiser_gaussian.pt`, `denoiser_mixed.pt`, `denoiser_structured.pt`) |

## Arquitectura y entrenamiento

El modelo base es GPT-2 small (openai-community/gpt2), y el módulo de denoising se entrena sobre las activaciones de la capa 6 (antes del sexto bloque transformer). Cada archivo `.pt` contiene un `state_dict` de la red `DeepSwiGLUDenoiser`, junto con la descripción del tipo de ruido usado, la media y desviación estándar de las 768 coordenadas de activación, y el historial de entrenamiento.

El entrenamiento se realizó en CPU, con tres variantes de corrupción:

- `denoiser_gaussian.pt`: entrenado con ruido gaussiano, error medio de recuperación `0.07531`.
- `denoiser_mixed.pt`: mezcla de ruido gaussiano y desplazamientos a lo largo de direcciones SAE (Sparse Autoencoder) aleatorias; error `0.07493` en direcciones SAE nuevas.
- `denoiser_structured.pt`: entrenado solo con desplazamientos a lo largo de direcciones SAE; se conserva como ablación negativa.

El vector de steering final (CAA), la característica SAE `15262` y los candidatos más cercanos no se incluyeron en el banco de direcciones de entrenamiento, para evaluar la generalización a direcciones no vistas.

## Capacidades

- Restauración de activaciones corruptas: el modelo aprende a recuperar las activaciones originales de la capa 6 de GPT-2 small a partir de versiones alteradas por ruido gaussiano o por desplazamientos a lo largo de direcciones SAE.
- Soporte para múltiples tipos de ruido: los tres checkpoints cubren diferentes escenarios de corrupción (gaussiano, mixto y estructurado).
- Compatible con técnicas de *activation steering*: se puede integrar en pipelines de interpretabilidad para corregir las activaciones después de inyectar vectores de dirección.
- No es un modelo generativo: no produce texto ni tiene capacidades de razonamiento, tool calling o agentes. Es un módulo auxiliar de procesamiento de activaciones.

## Casos de uso

- **Investigación en interpretabilidad mecánica**: el denois puede usarse para analizar cómo el ruido de steering afecta las activaciones internas de GPT-2, ayudando a caracterizar la robustez de la técnica.
- **Mejora de técnicas de control de modelos**: aunque el autor indica que no supera al simple steering con `alpha=0.4`, el modelo sirve como baseline para comparar métodos de corrección de activaciones.
- **Ablación de direcciones SAE**: el checkpoint `denoiser_structured.pt` permite estudiar el efecto de corregir solo desplazamientos SAE, útil para aislar contribuciones de características específicas.
- **Validación de experimentos de steering**: se puede usar para comprobar si un vector de dirección dado produce corrupción en las activaciones y cuánto se puede recuperar.
- **Entrenamiento de denoisadores en otros modelos**: la arquitectura `DeepSwiGLUDenoiser` puede adaptarse a otros tamaños de GPT-2 o modelos similares, como punto de partida para investigar denoising en otras capas.
- **Investigación sobre robustez adversarial**: el repositorio se enmarca en la evaluación de la resistencia del steering frente a perturbaciones, lo que puede servir para diseñar defensas.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, etc.), ya que no es un modelo de lenguaje. En su lugar, proporciona el error medio de recuperación de activaciones (RMSE sobre las activaciones restauradas) para cada checkpoint:

| Checkpoint | Error medio de recuperación |
|---|---|
| `denoiser_gaussian.pt` | 0.07531 |
| `denoiser_mixed.pt` | 0.07493 (en direcciones SAE nuevas) |
| `denoiser_structured.pt` | no reportado explícitamente (ablación negativa) |

No se han publicado resultados de benchmarks comparativos en la información disponible.

## Requisitos de hardware

- El modelo tiene solo 2.1 millones de parámetros, por lo que cabe en memoria RAM de cualquier máquina moderna (menos de 10 MB en FP32).
- Se puede ejecutar en CPU sin GPU; el entrenamiento se realizó en CPU.
- Para la inferencia, basta un entorno con PyTorch instalado.
- No se han proporcionado datos de latencia o throughput, pero al ser un módulo de denoising de un vector de 768 dimensiones, la ejecución es casi instantánea.
- No se requiere vLLM, Ollama ni otros frameworks de despliegue de LLM; se usa directamente como módulo de PyTorch.

## Comparativa con modelos similares

No hay modelos directamente comparables en el ecosistema de *activation steering* que sean públicos y ofrezcan denoising de activaciones. El propio repositorio compara sus resultados con el método de referencia: la suma directa del vector SAE con `alpha=0.4` (sin denoising). El autor reporta que este método simple supera al denoisador en términos de calidad del texto generado, aunque el denoisador restaura mejor las activaciones. Por tanto, la comparativa relevante es:

| Método | Error de recuperación | Rendimiento textual |
|---|---|---|
| Denoisador (mixto) | 0.07493 | No supera el baseline |
| Suma directa (`alpha=0.4`) | No aplica | Mejor según el autor |
| Denoisador (gaussiano) | 0.07531 | Inferior al baseline |

No hay otros modelos comparables en el ecosistema.

## Limitaciones y advertencias

- **No demuestra superioridad estadística**: según el autor, ninguno de los denoisadores mostró una ventaja confiable sobre el simple steering con `alpha=0.4`. Su uso en producción debe justificarse con experimentos propios.
- **Solo cubre una capa y un modelo**: está entrenado específicamente para las activaciones de la capa 6 de GPT-2 small. No es transferible a otros modelos o capas sin reentrenamiento.
- **Dependencia de direcciones SAE**: el rendimiento en direcciones SAE nuevas es ligeramente inferior, lo que sugiere cierta sensibilidad a la distribución de direcciones.
- **Riesgo de sesgo en el experimento**: el banco de direcciones de entrenamiento excluye el vector CAA final, lo que puede limitar su capacidad de generalización a otros vectores de steering.
- **Licencia MIT**: permite uso comercial, pero se recomienda citar el repositorio original.
- **Sin soporte de idiomas**: al ser un módulo de procesamiento de activaciones, no tiene aplicación directa en tareas de texto.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/zorikovm/robust-activation-steering)
- [Repositorio principal del autor en GitHub](https://github.com/zorikovm/robust-activation-steering)
- [Artículo sobre robustez adversarial del activation steering (arXiv)](https://arxiv.org/html/2606.07696v1)
- [Librería IBM de activation steering (GitHub)](https://github.com/IBM/activation-steering)
- [Artículo sobre detección de steering (arXiv)](https://arxiv.org/html/2511.21399v2)
- [Blog de Swastik Roy sobre activation steering](https://huggingface.co/blog/royswastik/activation-steering)
