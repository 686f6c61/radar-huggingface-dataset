# xet-team/privatelink-upload-example

## Resumen
Este repositorio no contiene un modelo de inteligencia artificial, sino una configuración de infraestructura en Terraform para habilitar rutas de subida privadas a Hugging Face mediante AWS PrivateLink. Lo desarrolla el equipo Xet de Hugging Face, responsable del backend de almacenamiento Xet que sustituye a Git LFS en el Hub. El objetivo es que el tráfico de subida de modelos y datasets permanezca dentro de la red de AWS, evitando el coste de salida a internet.

La solución crea endpoints de interfaz VPC, grupos de seguridad y zonas DNS privadas para dos rutas: una mediante la CLI de `hf` (recomendada por su deduplicación por chunks) y otra compatible con la API de S3. No hay arquitectura de modelo, parámetros ni contexto porque no se trata de un sistema de IA. Su relevancia es operativa: reduce costes y mejora la privacidad en transferencias de grandes volúmenes de datos.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (infraestructura Terraform, no modelo de IA) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento
No aplica. Este repositorio no contiene un modelo entrenado ni una arquitectura de red neuronal. Se trata de código Terraform que define recursos de AWS: endpoints de interfaz VPC, un grupo de seguridad y zonas DNS privadas por hostname. La lógica de transferencia se apoya en el cliente Xet (`xet-core`), que realiza deduplicación por chunks en el lado del cliente para minimizar el volumen de datos enviado.

No hay datos de entrenamiento, tokens, ni procesos de RLHF o DPO. La única innovación técnica relevante es el uso de PrivateLink para mantener el tráfico de subida dentro de la red de AWS, con certificados TLS que ya cubren los hostnames `cas-server.xethub.hf.co` y `s3.hf.co`.

## Capacidades
- No es un modelo de IA, por lo que no genera texto, código ni realiza razonamiento.
- Proporciona dos rutas de subida privadas: una vía CLI `hf` (con deduplicación por chunks) y otra vía API S3.
- Crea endpoints de interfaz VPC y zonas DNS privadas scoped a la VPC del cliente.
- Soporta regiones fuera de `us-east-1` mediante el parámetro `service_region`.
- Permite seleccionar subredes por AZ ID para evitar desajustes entre zonas físicas y nombres de zona.
- Incluye un script de verificación (`verify-privatelink.sh`) para comprobar la conectividad desde una instancia en la VPC.

## Casos de uso
- Subida de modelos grandes a Hugging Face desde entornos AWS sin coste de egress: el tráfico de datos permanece en la red de AWS, reduciendo la factura de salida a internet.
- Automatización de pipelines de CI/CD que publican checkpoints de modelos: la CLI `hf` se integra en scripts existentes sin cambiar credenciales ni hostname, solo la resolución DNS interna.
- Transferencia de datasets masivos desde instancias de entrenamiento en VPC: la ruta S3 permite usar herramientas compatibles con la API de S3 para cargas directas.
- Entornos con requisitos de privacidad o cumplimiento: al no salir a internet, los datos sensibles no atraviesan la red pública durante la subida.
- Sincronización periódica de artefactos entre múltiples cuentas AWS y el Hub: los endpoints se pueden replicar en varias VPCs usando el mismo Terraform.
- Migración desde Git LFS a Xet: este repositorio facilita la adopción del nuevo backend de almacenamiento en organizaciones que ya usan AWS.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de IA, no existen métricas de precisión, razonamiento o generación. El rendimiento de la transferencia depende de la configuración de red y del tamaño de los chunks, pero no se proporcionan cifras concretas.

## Requisitos de hardware
- No requiere GPU ni VRAM, ya que no es un modelo de inferencia.
- Necesita una cuenta de AWS con VPC y subredes en la región objetivo (por defecto `us-east-1`).
- El cliente `hf` CLI debe estar instalado en la máquina desde la que se realiza la subida.
- Para la ruta S3, se requiere acceso a la API de S3 (credenciales AWS).
- El despliegue se realiza con Terraform; no hay opciones de vLLM, llama.cpp, Ollama ni TGI porque no aplican.

## Comparativa con modelos similares
No disponible. Este repositorio no pertenece a la categoría de modelos de IA, por lo que no existen alternativas comparables en términos de parámetros, contexto o rendimiento. Su función es puramente infraestructural dentro del ecosistema de Hugging Face.

## Limitaciones y advertencias
- No es un modelo de IA: cualquier uso como tal es inválido y no producirá resultados.
- La configuración requiere coordinación manual con el equipo Xet: el endpoint queda en estado `pendingAcceptance` hasta que ellos lo aceptan.
- La ruta S3 cubre menos zonas de disponibilidad que la ruta CLI `hf`; hay que ajustar `s3_subnet_ids` si las subredes incluyen zonas no soportadas.
- La autenticación y las llamadas de commit siguen pasando por `huggingface.co` a través de internet; solo el tráfico de datos usa PrivateLink.
- El emparejamiento de zonas por AZ ID es obligatorio: usar nombres de zona puede colocar el endpoint en una zona física distinta a la del cómputo.
- No se especifica licencia del repositorio; hay que contactar con el equipo Xet para aclarar términos de uso.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/xet-team/privatelink-upload-example
- Perfil de Xet Team: https://huggingface.co/xet-team
- Documentación de Xet en Hugging Face: https://huggingface.co/docs/hub/xet/index
- Repositorio xet-core en GitHub: https://github.com/huggingface/xet-core
- Blog sobre Xet en el Hub: https://github.com/huggingface/blog/blob/main/xet-on-the-hub.md
