# torpedo2003/SAD

## Resumen

SAD (Sample-Aligned Decoders) es un conjunto de decodificadores de reemplazo directo ("drop-in") para modelos generativos latentes, desarrollado por Yu Lei y colaboradores del Instituto de Computación de la Academia China de Ciencias, la Universidad de la Academia China de Ciencias y la Universidad de Tsinghua. No se trata de un modelo generativo completo, sino de un componente: cada archivo contiene únicamente el decodificador (`decoder.*`, `post_quant_conv.*`) del autoencoder original, afinado con la técnica SAD sobre los latentes de un generador concreto.

El problema que resuelve es el desajuste entre el espacio latente en el que se entrena el generador y la distribución de latentes que el decodificador espera encontrar en inferencia. Al afinar solo el decodificador sobre los latentes reales del generador y su sampler, se mejora la calidad de la imagen reconstruida sin tocar el codificador, el espacio latente ni el generador, y por tanto sin incrementar el coste de inferencia.

El repositorio ocupa 1,5 GB y contiene ocho decodificadores en formato safetensors, cada uno asociado a una combinación específica de generador, tokenizador y sampler (DiT-XL/2, SiT-XL/2 + REPA, LightningDiT-XL, REPA-E y PixArt-α). El entrenamiento de cada decodificador es muy ligero: 2.000 pasos, aproximadamente una hora de GPU. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de autoencoder latente (VAE), derivado de SD-VAE, VA-VAE o E2E-VAE segun el archivo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Cada archivo contiene exclusivamente los pesos del decodificador y la `post_quant_conv` del autoencoder original, que actua como tokenizador del generador correspondiente. El codificador, el espacio latente y el generador permanecen congelados. Los decodificadores se construyen sobre tres familias de tokenizadores: SD-VAE (variante ft-EMA), VA-VAE y E2E-VAE. Los decodificadores basados en SD-VAE son compatibles con el ecosistema `diffusers`; los de VA-VAE y E2E-VAE deben cargarse en las clases de autoencoder de los repositorios LightningDiT y REPA-E respectivamente.

El entrenamiento usa la discrepancia GAN en el espacio de DINOv2 (con λ = 0,05 en ImageNet y 0,01 en PixArt-α) o bien MMD (con λ = 1), sumado a un ancla L1 sobre el codificador. Cada decodificador se entrena durante 2.000 pasos, lo que supone aproximadamente una hora de GPU. La innovacion clave es que el decodificador se ajusta sobre los latentes producidos por un generador y un sampler concretos, de modo que la distribucion de entrada del decodificador coincide con la que vera en produccion. El articulo asociado es un preprint de arXiv de 2026.

## Capacidades

- Reconstruccion y decodificacion de imagenes a partir de latentes generados por modelos de difusion latente.
- Reemplazo directo del decodificador en pipelines existentes sin reentrenar el generador ni modificar el espacio latente.
- Compatibilidad con multiples generadores: DiT-XL/2, SiT-XL/2 + REPA, LightningDiT-XL, REPA-E (SiT-XL/1) y PixArt-α a 256 px.
- Soporte de distintos samplers: DDPM oficial de 250 pasos con cfg 1.5, DPM-Solver++ de 50 pasos, SDE de 250 pasos y receta de 20 pasos con guidance 4.5 para PixArt-α.
- Dos variantes de funcion de perdida por archivo: `sad-gan` (discrepancia GAN en DINOv2) y `sad-mmd` (MMD), disponibles para los cuatro decodificadores de DiT-XL/2.
- No incluye generacion de texto, razonamiento, codigo, tool calling ni capacidades de agente.

## Casos de uso

- Mejora de calidad en pipelines de difusion latente ya desplegados: sustituir el decodificador original por el SAD correspondiente al generador y sampler en uso, sin cambiar el resto del pipeline ni el coste de inferencia.
- Investigacion en generacion de imagenes con DiT-XL/2: comparar las variantes `sad-gan` y `sad-mmd` sobre los mismos latentes para evaluar el efecto de la funcion de perdida en la fidelidad de reconstruccion.
- Experimentos con samplers rapidos: usar los decodificadores `dit-xl2-256-dpm50` para pipelines de 50 pasos con DPM-Solver++, donde el desajuste entre latentes de entrenamiento y de inferencia suele ser mayor.
- Evaluacion de tokenizadores alternativos: emplear los decodificadores de VA-VAE y E2E-VAE en los codigos de LightningDiT y REPA-E para estudiar como afecta el tokenizador a la calidad final.
- Integracion en PixArt-α a 256 px: cargar `pixart-alpha-256/sad-gan.safetensors` en flujos de 20 pasos con guidance 4.5 para mejorar la reconstruccion sin alterar el generador.
- Entrenamiento de decodificadores propios: seguir la guia de entrenamiento del repositorio para adaptar SAD a un generador nuevo, con un coste estimado de una hora de GPU por decodificador.
- Reproduccion de resultados academicos: replicar las comparaciones del articulo cargando los pesos con `safetensors` y `huggingface_hub` sin depender del paquete `sad`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse solo del decodificador de un VAE, el requisito es una fraccion del de un pipeline de difusion completo. El repositorio completo ocupa 1,5 GB, repartidos entre ocho archivos.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `cuda` sin especificar modelo de GPU.
- Cabe en GPU de consumo: no confirmado en la informacion disponible, aunque el tamano de los pesos y el hecho de que solo se sustituya el decodificador sugieren que si; no se aporta una cifra concreta.
- Opciones de despliegue: `diffusers` (para los decodificadores basados en SD-VAE), clases de autoencoder de LightningDiT y REPA-E (para VA-VAE y E2E-VAE), y carga directa con `safetensors` y `huggingface_hub`.
- Latencia y throughput: no disponible. La model card indica que el coste de inferencia no cambia respecto al decodificador original.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAD (este modelo) | Decodificador VAE afinado | no disponible | no aplica | MIT | Hugging Face, 8 archivos safetensors |
| SD-VAE (ft-EMA) | Decodificador VAE original | no disponible | no aplica | CreativeML OpenRAIL-M (segun la distribucion de Stable Diffusion) | Ampliamente disponible |
| VA-VAE | Tokenizador/decodificador VAE | no disponible | no aplica | no disponible | Repositorio LightningDiT |
| E2E-VAE | Tokenizador/decodificador VAE | no disponible | no aplica | no disponible | Repositorio REPA-E |

No se dispone de datos de rendimiento comparativo entre SAD y los decodificadores originales en la informacion proporcionada.

## Limitaciones y advertencias

- Cada decodificador esta entrenado para un generador y un sampler concretos; usar un archivo con un pipeline distinto al indicado en la tabla de archivos puede degradar la calidad de reconstruccion.
- Solo se sustituye el decodificador: no corrige limitaciones del generador ni del espacio latente, y no mejora la diversidad ni la fidelidad de la generacion en si.
- Los decodificadores de VA-VAE y E2E-VAE no son modelos de `diffusers` y requieren cargarse en las clases de autoencoder de LightningDiT y REPA-E, lo que anade complejidad de integracion.
- El entrenamiento es muy corto (2.000 pasos, una hora de GPU); no se documentan en la informacion disponible evaluaciones extensas de robustez ni de generalizacion fuera de las condiciones de entrenamiento.
- No hay informacion sobre sesgos, riesgo de alucinacion visual ni comportamiento con dominios alejados de ImageNet o de los datos de PixArt-α.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia de los tokenizadores subyacentes (SD-VAE, VA-VAE, E2E-VAE) y de los generadores con los que se combina.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- El articulo asociado es un preprint de arXiv de 2026; los resultados pueden no haber pasado revision por pares.

## Enlaces

- Hugging Face: https://huggingface.co/torpedo2003/SAD
- Pagina del proyecto: https://torpedo2003.github.io/SAD/
- Codigo: https://github.com/torpedo2003/SAD
- Guia de entrenamiento: https://github.com/torpedo2003/SAD/tree/main/training
- LightningDiT: https://github.com/hustvl/LightningDiT
- REPA-E: https://github.com/End2End-Diffusion/REPA-E
- Perfil del autor: https://torpedo2003.github.io/
